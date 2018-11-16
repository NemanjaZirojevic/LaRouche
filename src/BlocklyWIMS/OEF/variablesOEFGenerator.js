/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating JavaScript for variable blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.OEF.variables');

goog.require('Blockly.OEF');

Blockly.OEF['variables_get'] = function(block) {
  console.log("Variable setter line 32 variablesOEFGenerator.js");
  // Variable getter.
  var code = '\\'+Blockly.OEF.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  return ['', Blockly.OEF.ORDER_ATOMIC];
};

Blockly.OEF['variables_set'] = function(block) {
  console.log("Variable setter line 39 variablesOEFGenerator.js");
  // // Variable setter.
  // var argument0 = Blockly.OEF.valueToCode(block, 'VALUE',
  //     Blockly.OEF.ORDER_ASSIGNMENT) || '0';
  // var varName = Blockly.OEF.variableDB_.getName(
  //     block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  // variable_List[varName].setValue(argument0.substring(0,argument0.length-1));
  // return varName + ' = ' + argument0 + ';\n';
  return '';
};

Blockly.OEF['wims_change_type'] = function(block)
{
  console.log("Variable setter line 52 variablesOEFGenerator.js");
  // Variable setter.
  var varName = Blockly.OEF.variableDB_.getName(
      block.getFieldValue('VARIABLE_CHOICE'), Blockly.Variables.NAME_TYPE);
  var type = block.getFieldValue('TYPE');
  variable_List[varName].setType(type);
  return '';
};

Blockly.OEF['wims_define_variable'] = function(block) {
  // Variable setter.
  console.log("Variable setter line 61 variablesOEFGenerator.js");
  var varName = Blockly.OEF.variableDB_.getName(
      block.getFieldValue('VARIABLE_CHOICE'), Blockly.Variables.NAME_TYPE);
  var type = block.getFieldValue('TYPE');
  var editor = block.getField('WIMS_EDITOR').quillEditor_;
  editor.setContents(JSON.parse(block.getFieldValue('WIMS_EDITOR')));
  var value = new SEditor(editor);
  variable_List[varName].setType(type);
  variable_List[varName].setValue(value.to_variable_value());
  return '';
};
