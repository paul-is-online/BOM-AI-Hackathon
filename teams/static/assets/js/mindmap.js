/* ============================================================
   MindMap Library
   ============================================================

   QUICK START
   -----------
   const map = new MindMap('#mindmap-canvas');

   // Build a tree
   const root = map.node('My Topic');
   const child = root.add('Subtopic A');
   child.add('Detail 1');
   child.add('Detail 2');
   const other = root.add('Subtopic B', { color: 'teal' });
   other.add('Item X');

   map.render();

   API
   ---
   map.node(label, opts?)            → creates & returns the root node
   node.add(label, opts?)            → adds a child, returns new node
   node.remove()                     → removes this node
   node.setLabel(text)               → rename
   node.setColor(colorName)          → recolor
   node.collapse()                   → hide children
   node.expand()                     → show children
   node.toggle()                     → toggle expand/collapse
   node.find(label)                  → depth-first search by label
   map.getNode(path)                 → get by path, e.g. 'Root/Child/Grandchild'
   map.render()                      → re-draw (call after programmatic changes)

   OPTIONS
   -------
   color: string   — one of the named palette colors (see PALETTE below)
   fontSize: number — override font size for this node

   COLORS
   ------
   'blue', 'teal', 'amber', 'coral', 'purple', 'green', 'pink', 'sky', 'rose'
   ...or any CSS color string like '#ff6b6b'
   ============================================================ */

// ---- PALETTE -----------------------------------------------
const PALETTE = {
  blue:   { fill: '#4a90d9', stroke: '#2e6db4', text: '#fff', light: '#dbeafe' },
  teal:   { fill: '#2bbb8f', stroke: '#1a8e6d', text: '#fff', light: '#d1fae5' },
  amber:  { fill: '#f5a623', stroke: '#d4880f', text: '#fff', light: '#fef3c7' },
  coral:  { fill: '#f07050', stroke: '#c94f30', text: '#fff', light: '#fce7e0' },
  purple: { fill: '#8b6ddd', stroke: '#6349b5', text: '#fff', light: '#ede9fe' },
  green:  { fill: '#56b04b', stroke: '#3a8730', text: '#fff', light: '#dcfce7' },
  pink:   { fill: '#e86aaa', stroke: '#c44a88', text: '#fff', light: '#fce7f3' },
  sky:    { fill: '#38bcd8', stroke: '#1a96b8', text: '#fff', light: '#e0f2fe' },
  rose:   { fill: '#e84f6a', stroke: '#c03050', text: '#fff', light: '#ffe4e6' },
  gray:   { fill: '#8a8a8a', stroke: '#666',    text: '#fff', light: '#f3f3f3' },
};

function resolveColor(c) {
  if (!c) return PALETTE.blue;
  if (PALETTE[c]) return PALETTE[c];
  // raw CSS color
  return { fill: c, stroke: c, text: '#fff', light: '#eee' };
}

// ---- NODE CLASS --------------------------------------------
let _nodeId = 0;

export class MapNode {
  constructor(label, opts = {}, parent = null, map = null) {
    this.id       = ++_nodeId;
    this.label    = label;
    this.opts     = opts;
    this.parent   = parent;
    this._map     = map;
    this.children = [];
    this.collapsed = true;
    // layout (computed)
    this.x = 0;
    this.y = 0;
    this.rx = 60; // ellipse rx
    this.ry = 36; // ellipse ry
  }

  add(label, opts = {}) {
    const child = new MapNode(label, opts, this, this._map || this);
    if (!child._map && this._map) child._map = this._map;
    this.children.push(child);
    return child;
  }

  remove() {
    if (!this.parent) return;
    this.parent.children = this.parent.children.filter(c => c !== this);
  }

  setLabel(text) { this.label = text; }
  setColor(c)    { this.opts.color = c; }
  collapse()     { this.collapsed = true; }
  expand()       { this.collapsed = false; }
  toggle()       { this.collapsed = !this.collapsed; }

  find(label) {
    if (this.label === label) return this;
    for (const c of this.children) {
      const found = c.find(label);
      if (found) return found;
    }
    return null;
  }

  // depth from root
  get depth() {
    let d = 0, n = this;
    while (n.parent) { d++; n = n.parent; }
    return d;
  }

  // visually effective radius — scales with child count so busy nodes are bigger
  get visualRx() {
    const d = this.depth;
    const n = this.children.length;
    // Base size by depth
    let base;
    if (d === 0) base = 82;
    else if (d === 1) base = 58;
    else if (d === 2) base = 44;
    else base = Math.max(34, 44 - (d - 2) * 5);
    // Bonus: +3px per child beyond 3, capped generously
    const childBonus = Math.min(n > 3 ? (n - 3) * 3 : 0, 50);
    return base + childBonus;
  }
  get visualRy() {
    return this.visualRx * 0.62;
  }
  setNote(text) {
  if (!this._note) {
    this._note = {
      visible: true,
      text: '',
      colorIdx: 0,
      offsetX: this.rx + 20,
      offsetY: -(this.ry + 60),
      width: 210,
      height: 130,
    };
  }
  this._note.text = text;
  this._note.visible = true;
}
}

// ---- MINDMAP CLASS -----------------------------------------
export class MindMap {
  constructor(selector) {
    this.svg        = document.querySelector(selector);
    this.viewport   = this.svg.querySelector('#viewport');
    this.connLayer  = this.svg.querySelector('#connectors-layer');
    this.nodeLayer  = this.svg.querySelector('#nodes-layer');
    this.notesLayer = this.svg.querySelector('#notes-layer');
    this._root      = null;
    this._pan       = { x: 0, y: 0 };
    this._zoom      = 1;
    this._dragging  = false;
    this._lastMouse = { x: 0, y: 0 };
    this._initInteraction();
    this._initControls();
  }

  node(label, opts = {}) {
    this._root = new MapNode(label, opts, null, this);
    return this._root;
  }

  getNode(path) {
    if (!this._root) return null;
    const parts = path.split('/');
    let cur = this._root;
    if (cur.label !== parts[0]) return null;
    for (let i = 1; i < parts.length; i++) {
      cur = cur.children.find(c => c.label === parts[i]);
      if (!cur) return null;
    }
    return cur;
  }

  render() {
    if (!this._root) return;
    this.connLayer.innerHTML = '';
    this.nodeLayer.innerHTML = '';
    this.notesLayer.innerHTML = '';

    const W = this.svg.clientWidth  || 800;
    const H = this.svg.clientHeight || 600;

    this._layout(this._root, W / 2, H / 2);
    this._drawSubtree(this._root);
    this._redrawNotes();
    this._applyTransform();
  }

  // ---- LAYOUT -----------------------------------------------
  _layout(node, cx, cy) {
    node.x = cx;
    node.y = cy;
    node.rx = node.visualRx;
    node.ry = node.visualRy;

    if (node.collapsed || node.children.length === 0) return;

    const children = node.children;
    const n = children.length;
    const depth = node.depth;

    // Each child bubble needs at least this much arc-length between centres
    // Use the child's own visualRx as the gauge for how much space it needs
    const minGap = 30; // px padding between bubble edges on the orbit ring

    // Find the largest child rx to set orbit radius
    const maxChildRx = Math.max(...children.map(c => c.visualRx));

    // Orbit radius: far enough that children don't overlap each other.
    // Circumference must fit n children each needing (2*maxChildRx + minGap).
    const neededCircumference = n * (2 * maxChildRx + minGap);
    const minByCircumference  = neededCircumference / (2 * Math.PI);

    // Also keep a minimum distance from parent edge so connectors have room
    const minByDepth = depth === 0
      ? node.rx + maxChildRx + 90
      : node.rx + maxChildRx + 60;

    const orbitRadius = Math.max(minByCircumference, minByDepth);

    // Arc sweep — full circle when there are many children; tighter when few
    let totalArc;
    if (n === 1)      totalArc = 0;
    else if (n <= 3)  totalArc = Math.PI * 0.75;
    else if (n <= 6)  totalArc = Math.PI * 1.4;
    else if (n <= 12) totalArc = Math.PI * 1.75;
    else              totalArc = Math.PI * 2 * 0.95; // near-full ring for huge fans

    // Base angle: away from parent, or upward for root
    let baseAngle = -Math.PI / 2;
    if (node.parent) {
      baseAngle = Math.atan2(node.y - node.parent.y, node.x - node.parent.x);
    }

    for (let i = 0; i < n; i++) {
      let angle;
      if (n === 1) {
        angle = baseAngle;
      } else {
        angle = baseAngle - totalArc / 2 + (totalArc / (n - 1)) * i;
      }
      const cx2 = node.x + Math.cos(angle) * orbitRadius;
      const cy2 = node.y + Math.sin(angle) * orbitRadius;
      this._layout(children[i], cx2, cy2);
    }
  }

  // ---- DRAW -------------------------------------------------
  _drawSubtree(node) {
    // Draw connectors first (behind nodes)
    if (!node.collapsed) {
      for (const child of node.children) {
        this._drawConnector(node, child);
        this._drawSubtree(child);
      }
    }
    this._drawNode(node);
  }

  _drawConnector(parent, child) {
    const x1 = parent.x, y1 = parent.y;
    const x2 = child.x,  y2 = child.y;

    // Control points for organic curved line
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx*dx + dy*dy);

    // Perpendicular wobble for organic feel
    const wobble = len * 0.08;
    const px = -dy / len * wobble;
    const py =  dx / len * wobble;

    const depth = child.depth;
    const strokeW = depth <= 1 ? 3 : depth <= 2 ? 2.5 : 2;
    const opacity = depth <= 1 ? 0.5 : 0.4;

    // Color: use child's color for connector
    const col = resolveColor(child.opts.color || parent.opts.color);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'connector');
    path.setAttribute('d', `M${x1},${y1} Q${mx+px},${my+py} ${x2},${y2}`);
    path.setAttribute('stroke', col.fill);
    path.setAttribute('stroke-width', strokeW);
    path.setAttribute('stroke-opacity', opacity);
    this.connLayer.appendChild(path);
  }

  _drawNode(node) {
    const depth = node.depth;
    const col   = resolveColor(node.opts.color);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'node-group');
    g.setAttribute('transform', `translate(${node.x},${node.y})`);
    g.setAttribute('data-id', node.id);

    // Shadow filter only for larger nodes
    const useFilter = depth <= 2;

    // Ellipse (bubble)
    const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    ellipse.setAttribute('class', 'node-bubble');
    ellipse.setAttribute('rx', node.rx);
    ellipse.setAttribute('ry', node.ry);
    ellipse.setAttribute('fill', col.fill);
    ellipse.setAttribute('stroke', col.stroke);
    ellipse.setAttribute('stroke-width', depth === 0 ? 3 : 2);

    if (useFilter) ellipse.setAttribute('filter', depth === 0 ? 'url(#shadow)' : 'url(#shadow-sm)');

    // If this node has collapsed children, add a subtle inner ring
    if (node.collapsed && node.children.length > 0) {
      ellipse.setAttribute('stroke-dasharray', '4 3');
    }

    g.appendChild(ellipse);

    // Text — wrap if needed
    const fontSize = node.opts.fontSize || (depth === 0 ? 20 : depth === 1 ? 15 : 13);
    const maxWidth = node.rx * 1.7;

    const lines = this._wrapText(node.label, fontSize, maxWidth);
    const lineH = fontSize * 1.25;
    const totalH = lines.length * lineH;
    const startY = -(totalH / 2) + lineH / 2;

    lines.forEach((line, i) => {
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('class', 'node-text');
      t.setAttribute('y', startY + i * lineH);
      t.setAttribute('font-size', fontSize);
      t.setAttribute('fill', col.text);
      t.textContent = line;
      g.appendChild(t);
    });

    // Dot indicator for collapsed nodes with children
    if (node.collapsed && node.children.length > 0) {
      const dots = [-10, 0, 10].forEach(dx => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', dx);
        c.setAttribute('cy', node.ry - 10);
        c.setAttribute('r', 2.5);
        c.setAttribute('fill', 'rgba(255,255,255,0.6)');
        g.appendChild(c);
      });
    }

    g.addEventListener('click', e => {
      e.stopPropagation();
      if (node.children.length > 0) {
        node.toggle();
        this.render();
      }
    });

    g.addEventListener('contextmenu', e => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleNote(node);
    });

    this.nodeLayer.appendChild(g);
  }

  // ---- NOTE LOGIC -------------------------------------------

  // Note palette: name → { bg, border, textColor }
  static NOTE_COLORS = [
    { name: 'cream',  bg: '#fffdf7', border: '#e0d8cc', text: '#333' },
    { name: 'yellow', bg: '#fffbe6', border: '#f5d76e', text: '#5a4700' },
    { name: 'blue',   bg: '#eef6ff', border: '#93c5fd', text: '#1e3a5f' },
    { name: 'green',  bg: '#edfff5', border: '#6ee7b7', text: '#064e3b' },
    { name: 'pink',   bg: '#fff0f6', border: '#f9a8d4', text: '#5b1a33' },
    { name: 'purple', bg: '#f5f0ff', border: '#c4b5fd', text: '#2e1065' },
    { name: 'coral',  bg: '#fff3ee', border: '#fdba74', text: '#7c2d12' },
  ];

  _toggleNote(node) {
    if (node._note && node._note.visible) {
      node._note.visible = false;
    } else {
      if (!node._note) {
        node._note = {
          visible: true,
          text: '',
          colorIdx: 0,
          // offset from node center in SVG units
          offsetX: node.rx + 20,
          offsetY: -(node.ry + 60),
          width: 210,
          height: 130,
        };
      } else {
        node._note.visible = true;
      }
    }
    this._redrawNotes();
  }

  _redrawNotes() {
    this.notesLayer.innerHTML = '';
    this._drawNotesForSubtree(this._root);
  }

  _drawNotesForSubtree(node) {
    if (node._note && node._note.visible) {
      this._drawNote(node);
    }
    for (const child of node.children) {
      this._drawNotesForSubtree(child);
    }
  }

  _drawNote(node) {
    const note   = node._note;
    const colors = MindMap.NOTE_COLORS;
    const col    = colors[note.colorIdx];

    const nx = node.x + note.offsetX;
    const ny = node.y + note.offsetY;
    const W  = note.width;
    const H  = note.height;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'note-group');

    // Connector line from node edge to note corner
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', node.x + (note.offsetX > 0 ? node.rx * 0.7 : -node.rx * 0.7));
    line.setAttribute('y1', node.y + (note.offsetY < 0 ? -node.ry * 0.5 : node.ry * 0.5));
    line.setAttribute('x2', nx + (note.offsetX > 0 ? 0 : W));
    line.setAttribute('y2', ny + H * 0.4);
    line.setAttribute('stroke', col.border);
    line.setAttribute('stroke-width', '1.5');
    line.setAttribute('stroke-dasharray', '5 4');
    line.setAttribute('stroke-linecap', 'round');
    g.appendChild(line);

    // foreignObject for the HTML note card
    const fo = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    fo.setAttribute('x', nx);
    fo.setAttribute('y', ny);
    fo.setAttribute('width', W);
    fo.setAttribute('height', H);

    const div = document.createElement('div');
    div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    div.className = 'note-box';
    div.style.border = `2px solid ${col.border}`;
    div.style.background = col.bg;

    // Toolbar: color swatches + close button
    const toolbar = document.createElement('div');
    toolbar.className = 'note-toolbar';
    toolbar.style.background = this._lighten(col.bg, 0.4);
    toolbar.style.borderBottom = `1.5px solid ${col.border}`;

    colors.forEach((c, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'note-color-swatch' + (i === note.colorIdx ? ' active' : '');
      swatch.style.background = c.bg;
      swatch.style.borderColor = i === note.colorIdx ? '#333' : c.border;
      swatch.style.outline = `1.5px solid ${c.border}`;
      swatch.style.outlineOffset = '0px';
      swatch.addEventListener('mousedown', e => {
        e.stopPropagation();
        note.colorIdx = i;
        this._redrawNotes();
      });
      toolbar.appendChild(swatch);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'note-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('mousedown', e => {
      e.stopPropagation();
      note.visible = false;
      this._redrawNotes();
    });
    toolbar.appendChild(closeBtn);
    div.appendChild(toolbar);

    // Textarea
    const ta = document.createElement('textarea');
    ta.className = 'note-textarea';
    ta.placeholder = 'Type a note…';
    ta.value = note.text;
    ta.style.color = col.text;
    ta.style.background = col.bg;
    ta.addEventListener('input', e => { note.text = e.target.value; });
    // Stop mousedown from starting a pan
    ta.addEventListener('mousedown', e => e.stopPropagation());
    div.appendChild(ta);

    fo.appendChild(div);
    g.appendChild(fo);

    // Drag handle on the note itself (drag the foreignObject)
    let dragStart = null;
    fo.style.cursor = 'grab';
    fo.addEventListener('mousedown', e => {
      if (e.target === ta || e.target.classList.contains('note-color-swatch') || e.target === closeBtn) return;
      e.stopPropagation();
      dragStart = { mx: e.clientX, my: e.clientY, ox: note.offsetX, oy: note.offsetY };
      fo.style.cursor = 'grabbing';
      const onMove = ev => {
        const dx = (ev.clientX - dragStart.mx) / this._zoom;
        const dy = (ev.clientY - dragStart.my) / this._zoom;
        note.offsetX = dragStart.ox + dx;
        note.offsetY = dragStart.oy + dy;
        this._redrawNotes();
      };
      const onUp = () => {
        fo.style.cursor = 'grab';
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    });

    this.notesLayer.appendChild(g);
  }

  _lighten(hex, amt) {
    // Very simple: just return the same color (toolbar uses slight bg difference via CSS)
    return hex;
  }

  _wrapText(text, fontSize, maxWidth) {
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.6));
    if (text.length <= charsPerLine) return [text];

    const words = text.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const test = current ? current + ' ' + word : word;
      if (test.length > charsPerLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  // ---- INTERACTION ------------------------------------------
  _initInteraction() {
    const svg = this.svg;

    // Pan
    svg.addEventListener('mousedown', e => {
      if (e.target.closest('.node-group')) return;
      this._dragging = true;
      this._lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', e => {
      if (!this._dragging) return;
      this._pan.x += e.clientX - this._lastMouse.x;
      this._pan.y += e.clientY - this._lastMouse.y;
      this._lastMouse = { x: e.clientX, y: e.clientY };
      this._applyTransform();
    });
    window.addEventListener('mouseup', () => { this._dragging = false; });

    // Touch pan
    let lastTouch = null;
    svg.addEventListener('touchstart', e => {
      if (e.touches.length === 1) lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });
    svg.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && lastTouch) {
        this._pan.x += e.touches[0].clientX - lastTouch.x;
        this._pan.y += e.touches[0].clientY - lastTouch.y;
        lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this._applyTransform();
      }
    });

    // Scroll zoom
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.91;
      const rect   = svg.getBoundingClientRect();
      const mx     = e.clientX - rect.left;
      const my     = e.clientY - rect.top;

      // Zoom toward cursor
      this._pan.x = mx + (this._pan.x - mx) * factor;
      this._pan.y = my + (this._pan.y - my) * factor;
      this._zoom  = Math.max(0.2, Math.min(4, this._zoom * factor));
      this._applyTransform();
    }, { passive: false });
  }

  _initControls() {
    document.getElementById('btn-zoom-in').addEventListener('click', () => this._zoomBy(1.2));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this._zoomBy(0.83));
    document.getElementById('btn-reset').addEventListener('click', () => {
      const W = this.svg.clientWidth  || 800;
      const H = this.svg.clientHeight || 600;
      this._pan  = { x: 0, y: 0 };
      this._zoom = 1;
      this._applyTransform();
      this.render();
    });
  }

  _zoomBy(factor) {
    const W = this.svg.clientWidth  || 800;
    const H = this.svg.clientHeight || 600;
    this._pan.x = W/2 + (this._pan.x - W/2) * factor;
    this._pan.y = H/2 + (this._pan.y - H/2) * factor;
    this._zoom  = Math.max(0.2, Math.min(4, this._zoom * factor));
    this._applyTransform();
  }

  _applyTransform() {
    this.viewport.setAttribute('transform',
      `translate(${this._pan.x},${this._pan.y}) scale(${this._zoom})`);
  }
}


// ================================================================
//  DEMO — stress-testing with 25 direct children on the root
// ================================================================
/*
const map = new MindMap('#mindmap-canvas');

const root = map.node('My Project', { color: 'blue' });

const colors = ['amber','teal','coral','purple','green','pink','sky','rose','amber','teal','coral','purple','green','pink','sky','rose','amber','teal','coral','purple','green','pink','sky','rose','amber'];

for (let i = 1; i <= 25; i++) {
  const branch = root.add(`Topic ${i}`, { color: colors[i - 1] });
  // Give each branch 2-4 children so the scaling is visible
  const subCount = 2 + (i % 3);
  for (let j = 1; j <= subCount; j++) {
    branch.add(`Sub ${i}.${j}`, { color: 'gray' });
  }
}

map.render();
 */


// ================================================================
//  HOW TO EXTEND (you can run this in the browser console)
// ================================================================
//
//  // Add a new branch to the root
//  const extra = map.getNode('My Project').add('New Topic', { color: 'purple' });
//  extra.add('Detail A', { color: 'gray' });
//  map.render();
//
//  // Navigate by path
//  const node = map.getNode('My Project/Topic 3/Sub 3.1');
//  node.add('Deep leaf', { color: 'sky' });
//  map.render();
//
//  // Collapse a branch
//  map.getNode('My Project/Topic 5').collapse();
//  map.render();
//
// ================================================================