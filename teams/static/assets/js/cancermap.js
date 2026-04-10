import {MindMap, MapNode} from "./mindmap.js";

// ================================================================
//  DEMO — Recreating the Sports mind map from the template image
// ================================================================
// Colour palette available:
/*
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
  */

const map = new MindMap('#mindmap-canvas');

const kanker = map.node('Cancer', {color: 'pink'});

const skin1 = kanker.add('Skin cancer numbah wumbah', {color: 'amber'});
skin1.add('Symptoms',      { color: 'purple' });
skin1.add('Causes',        { color: 'purple' });
const descriptionSkin1 = skin1.add('Description',   { color: 'purple' });
descriptionSkin1.setNote('Very bad cancer that kills u xd');

const skin2 = kanker.add('Skin cancer', {color: 'amber'});
skin2.add('Symptoms',      { color: 'purple' });
skin2.add('Causes',        { color: 'purple' });
skin2.add('Description',   { color: 'purple' });

const skin3 = kanker.add('Skin cancer', {color: 'amber'});
skin3.add('Symptoms',      { color: 'purple' });
skin3.add('Causes',        { color: 'purple' });
skin3.add('Description',   { color: 'purple' });

const skin4 = kanker.add('Skin cancer', {color: 'amber'});
skin4.add('Symptoms',      { color: 'purple' });
skin4.add('Causes',        { color: 'purple' });
skin4.add('Description',   { color: 'purple' });

const skin5 = kanker.add('Skin cancer', {color: 'amber'});
skin5.add('Symptoms',      { color: 'purple' });
skin5.add('Causes',        { color: 'purple' });
skin5.add('Description',   { color: 'purple' });

const skin6 = kanker.add('Skin cancer', {color: 'amber'});
skin6.add('Symptoms',      { color: 'purple' });
skin6.add('Causes',        { color: 'purple' });
skin6.add('Description',   { color: 'purple' });

const skin7 = kanker.add('Skin cancer', {color: 'amber'});
skin7.add('Symptoms',      { color: 'purple' });
skin7.add('Causes',        { color: 'purple' });
skin7.add('Description',   { color: 'purple' });

const skin8 = kanker.add('Skin cancer', {color: 'amber'});
skin8.add('Symptoms',      { color: 'purple' });
skin8.add('Causes',        { color: 'purple' });
skin8.add('Description',   { color: 'purple' });

const skin9 = kanker.add('Skin cancer', {color: 'amber'});
skin9.add('Symptoms',      { color: 'purple' });
skin9.add('Causes',        { color: 'purple' });
skin9.add('Description',   { color: 'purple' });

const skin10 = kanker.add('Skin cancer', {color: 'amber'});
skin10.add('Symptoms',      { color: 'purple' });
skin10.add('Causes',        { color: 'purple' });
skin10.add('Description',   { color: 'purple' });

const skin11 = kanker.add('Skin cancer', {color: 'amber'});
skin11.add('Symptoms',      { color: 'purple' });
skin11.add('Causes',        { color: 'purple' });
skin11.add('Description',   { color: 'purple' });

const skin12 = kanker.add('Skin cancer', {color: 'amber'});
skin12.add('Symptoms',      { color: 'purple' });
skin12.add('Causes',        { color: 'purple' });
skin12.add('Description',   { color: 'purple' });

const skin13 = kanker.add('Skin cancer', {color: 'amber'});
skin13.add('Symptoms',      { color: 'purple' });
skin13.add('Causes',        { color: 'purple' });
skin13.add('Description',   { color: 'purple' });

const skin14 = kanker.add('Skin cancer', {color: 'amber'});
skin14.add('Symptoms',      { color: 'purple' });
skin14.add('Causes',        { color: 'purple' });
skin14.add('Description',   { color: 'purple' });

const skin15 = kanker.add('Skin cancer', {color: 'amber'});
skin15.add('Symptoms',      { color: 'purple' });
skin15.add('Causes',        { color: 'purple' });
skin15.add('Description',   { color: 'purple' });

const skin16 = kanker.add('Skin cancer', {color: 'amber'});
skin16.add('Symptoms',      { color: 'purple' });
skin16.add('Causes',        { color: 'purple' });
skin16.add('Description',   { color: 'purple' });

const skin17 = kanker.add('Skin cancer', {color: 'amber'});
skin17.add('Symptoms',      { color: 'purple' });
skin17.add('Causes',        { color: 'purple' });
skin17.add('Description',   { color: 'purple' });

const skin18 = kanker.add('Skin cancer', {color: 'amber'});
skin18.add('Symptoms',      { color: 'purple' });
skin18.add('Causes',        { color: 'purple' });
skin18.add('Description',   { color: 'purple' });

const skin19 = kanker.add('Skin cancer', {color: 'amber'});
skin19.add('Symptoms',      { color: 'purple' });
skin19.add('Causes',        { color: 'purple' });
skin19.add('Description',   { color: 'purple' });

const skin20 = kanker.add('Skin cancer', {color: 'amber'});
skin20.add('Symptoms',      { color: 'purple' });
skin20.add('Causes',        { color: 'purple' });
skin20.add('Description',   { color: 'purple' });

map.render();

/*
// Root
const sports = map.node('Sports', { color: 'blue' });

// Branch 1: Individual Sports
const individual = sports.add('Individual\nSports', { color: 'amber' });
individual.add('Golf',    { color: 'gray' });
individual.add('Tennis',  { color: 'gray' });
individual.add('Cycling', { color: 'gray' });
individual.add('Track',   { color: 'coral' });

// Branch 2: Water Sports
const water = sports.add('Water\nSports', { color: 'teal' });
water.add('Swimming',      { color: 'teal' });
water.add('Water Aerobics',{ color: 'gray' });
water.add('Diving',        { color: 'gray' });
water.add('Water Polo',    { color: 'gray' });

// Branch 3: Contact Sports
const contact = sports.add('Contact\nSports', { color: 'teal' });
contact.add('Football',   { color: 'green' });
contact.add('Basketball', { color: 'gray' });
contact.add('Rugby',      { color: 'gray' });
contact.add('Soccer',     { color: 'gray' });

// Branch 4: Team Sports
const team = sports.add('Team\nSports', { color: 'amber' });
team.add('Basketball', { color: 'gray' });
team.add('Baseball',   { color: 'coral' });
team.add('Hockey',     { color: 'gray' });
team.add('Football',   { color: 'gray' });

// Render!
//map.render();
*/