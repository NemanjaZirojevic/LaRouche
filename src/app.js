
/** La Ruche WIMS Main app.js **/

var variable_List = {};
var answer_List = {};
var active_editor_analyse = null;
var prepEditor;
var analyseEditor;
var expanded = false;
var seEditor = null;


jQuery(document).ready(function($) {
	/*
	 * Set the strings in index.html according to the current language
	 */
	jQuery('#RId_Onglet_Entete').html(Blockly.Msg.WIMS_INTERFACE_TAB_HEADER);
	jQuery('#RId_Onglet_Enonce').html(Blockly.Msg.WIMS_INTERFACE_TAB_STATEMENT);
	jQuery('#RId_Onglet_Preparation').html(Blockly.Msg.WIMS_INTERFACE_TAB_PREPARATION);
	jQuery('#RId_Onglet_Analyse').html(Blockly.Msg.WIMS_INTERFACE_TAB_ANALYSIS);
	jQuery('#RId_Onglet_Code').html(Blockly.Msg.WIMS_INTERFACE_TAB_CODE);
	jQuery('#RId_Onglet_Sauvegarde').html(Blockly.Msg.WIMS_INTERFACE_TAB_SAVING);
	jQuery('#Rid_Entete_Label_Title').html(Blockly.Msg.WIMS_INTERFACE_HEADER_TITLE);
	jQuery('#Rid_Entete_Label_Language').html(Blockly.Msg.WIMS_INTERFACE_HEADER_LANGUAGE);
	jQuery('#Rid_Entete_Label_Name').html(Blockly.Msg.WIMS_INTERFACE_HEADER_NAME);
	jQuery('#Rid_Entete_Label_FirstName').html(Blockly.Msg.WIMS_INTERFACE_HEADER_FIRSTNAME);
	jQuery('#Rid_Entete_Label_Email').html(Blockly.Msg.WIMS_INTERFACE_HEADER_EMAIL);
	jQuery('#Rid_Entete_Label_EOFCode').html(Blockly.Msg.WIMS_INTERFACE_HEADER_OEF_CODE);
	jQuery('#title_EnTete').attr('placeholder',Blockly.Msg.WIMS_INTERFACE_HEADER_TITLE_PLACEHOLDER)
	jQuery('#language_EnTete').attr('placeholder',Blockly.Msg.WIMS_INTERFACE_HEADER_LANGUAGE_PLACEHOLDER)
	jQuery('#name_EnTete').attr('placeholder',Blockly.Msg.WIMS_INTERFACE_HEADER_NAME_PLACEHOLDER_PLACEHOLDER)
	jQuery('#firstName_EnTete').attr('placeholder',Blockly.Msg.WIMS_INTERFACE_HEADER_FIRSTNAME_PLACEHOLDER)
	jQuery('#email_EnTete').attr('placeholder',Blockly.Msg.WIMS_INTERFACE_HEADER_EMAIL_PLACEHOLDER)
	jQuery('#variable_creation_button').html(Blockly.Msg.WIMS_INTERFACE_BUTTON_VAR_CREATION);
	jQuery('#answer_creation_button').html(Blockly.Msg.WIMS_INTERFACE_BUTTON_ANSWER_CREATION);
	jQuery('#Rid_Analysis_Header_VarAnswers').html(Blockly.Msg.WIMS_INTERFACE_ANALYSIS_VARIABLES_AND_ANSWERS);
	jQuery('#Rid_Prep_Blockly_Toolbar_WIMS').attr('name',Blockly.Msg.WIMS_BLOCKLY_PREP_WIMS);
	jQuery('#Rid_Prep_Blockly_Toolbar_Variables').attr('name',Blockly.Msg.WIMS_BLOCKLY_PREP_VARIABLES);
	jQuery('#Rid_Prep_Blockly_Toolbar_Swarms').attr('name',Blockly.Msg.WIMS_BLOCKLY_PREP_SWARMS);
	jQuery('#Rid_Analysis_Blockly_Toolbar_Analysis').attr('name',Blockly.Msg.WIMS_BLOCKLY_ANALYSIS_ANALYSIS);
	jQuery('#Rid_Analysis_Blockly_Toolbar_Variables').attr('name',Blockly.Msg.WIMS_BLOCKLY_ANALYSIS_VARIABLES);
});

function change_onglet(name) {
	jQuery('#RId_Onglet_'+anc_onglet).removeClass('RCl_Onglet_Affiche').addClass('RCl_Onglet_Cache');
	jQuery('#RId_Onglet_'+name).removeClass('RCl_Onglet_Cache').addClass('RCl_Onglet_Affiche');
	jQuery('#RId_Contenu_Onglet_'+anc_onglet).addClass('RCl_Contenu_Onglet_Cache');
	jQuery('#RId_Contenu_Onglet_'+name).removeClass('RCl_Contenu_Onglet_Cache');
	anc_onglet = name;
	if (typeof(prepEditor)!='undefined') {
		prepEditor.onResize();
		Blockly.svgResize(prepEditor.mBlocklyWorkspace);
		prepEditor.mBlocklyWorkspace.scrollX = 27;
	}
	if (typeof(analyseEditor)!='undefined') {
		analyseEditor.onResize();
		Blockly.svgResize(analyseEditor.mBlocklyWorkspace);
		analyseEditor.mBlocklyWorkspace.scrollX = 27;
	}
}

// hljs.configure({   // optionally configure hljs -> ask Bernadette for OEF definition file
//   languages: ['HTML']
// });


var quill = new Quill('#editor-enonce', {
	modules: {
		formula: true,
		// syntax: true,
		toolbar: '#toolbar-container'
	},
	placeholder: Blockly.Msg.WIMS_STATEMENT_EDITOR_PLACEHOLDER,
	theme: 'snow'
});


var quill_EnTete = new Quill('#editor-EnTete', {
	modules: {
		toolbar: false
	},
	placeholder: Blockly.Msg.WIMS_HEADER_EDITOR_PLACEHOLDER,
	theme: 'snow'
});



/* SE DEMENER POUR ENLEVER CES VARIABLES GLOBALES */
var anc_onglet = 'Entete';
change_onglet(anc_onglet);
quill_EnTete.format('code-block',true); // WEBKIT : ne fonctionne que si l'onglet est actif
var editor_EnTete = new SEditor(quill_EnTete);

change_onglet('Enonce');
var editor_Enonce = new SEditor(quill);


/** Modify the Blockly source by adding LaRuche specific parts
 ** hack some Blockly functions
 **/

/** Create a variable in all editors, Blockly and Quill
 **
 ********* IN *************
 ** name : name of the variable to be created
 **/
Blockly.Workspace.prototype.createVariable_orig = Blockly.Workspace.prototype.createVariable;
Blockly.Workspace.prototype.createVariable = function(name) {
	console.log("app.js line 103 createVaraible");
	Blockly.Workspace.prototype.createVariable_orig.call(this,name);
	/* Called from within the Blockly code to build an OEF variable */
	if(variable_List[name]==null){
   	variable_List[name] = new Variable(name,'Real');
		variable_List[name].init();
   	update_all_view();
 	}
	if (this.id == prepEditor.mBlocklyWorkspace.id){
		analyseEditor.mBlocklyWorkspace.createVariable(name);
	}
}

/** Rename a variable in all editors, Blockly and Quill
 **
 ********* IN *************
 ** oldName : name of the variable to be changed
 ** newName : new name of the variable
 **/
Blockly.Workspace.prototype.renameVariable_orig = Blockly.Workspace.prototype.renameVariable;
Blockly.Workspace.prototype.renameVariable = function(oldName, newName) {
	console.log("app.js line 124 renameVariable");
	Blockly.Workspace.prototype.renameVariable_orig.call(this,oldName, newName);
	if(!variable_List[newName]){
		variable_List[newName] = variable_List[oldName];
		variable_List[newName].setName(newName);
		changeAllNameVar(oldName,newName);
		//Ajouter le changement dans tous les quill
		delete variable_List[oldName];
		update_all_view();
		if(this.id == prepEditor.mBlocklyWorkspace.id){
			analyseEditor.mBlocklyWorkspace.renameVariable_orig.call(analyseEditor.mBlocklyWorkspace,oldName, newName);
		} else if (this.id == analyseEditor.mBlocklyWorkspace.id){
			prepEditor.mBlocklyWorkspace.renameVariable_orig.call(prepEditor.mBlocklyWorkspace,oldName, newName);
		}
	}
}

/** Delete a variable in all editors, Blockly and Quill
 **
 ********* IN *************
 ** name : name of the variable to be deleted
 **/
Blockly.Workspace.prototype.deleteVariable_orig = Blockly.Workspace.prototype.deleteVariable;
Blockly.Workspace.prototype.deleteVariable = function(name) {
	console.log("app.js line 148 deleteVariable");
	if (variable_List[name]) {
		delete variable_List[name];
	  editor_Enonce.destroy_var(name);
	  for(var key in answer_List){
	    answer_List[key].get_block_html().get_editor().destroy_var(name);
	  }
	  for(var i = 0; i<Blockly.ExternalDiv.owner.length;i++){
			var tmpEditor = new SEditor(Blockly.ExternalDiv.owner[i].quillEditor_);
			tmpEditor.destroy_var(name);
		}
	  update_all_view();
		Blockly.Workspace.prototype.deleteVariable_orig.call(this,name);
		if (this.id == prepEditor.mBlocklyWorkspace.id){
			analyseEditor.mBlocklyWorkspace.deleteVariable_orig.call(analyseEditor.mBlocklyWorkspace,name);
		} else if (this.id == analyseEditor.mBlocklyWorkspace.id){
			prepEditor.mBlocklyWorkspace.deleteVariable_orig.call(prepEditor.mBlocklyWorkspace,name);
		}
	}
}

/** Fonction qui permet d'ajouter une réponse à un éditeur Quill
** et de l'ajouter à la liste des réponses
**
********* IN *************
** editor : SEditor où il faut ajouter la réponse
** ans_list : la liste des réponses où ajouter la nouvelle réponse
**
*/
function add_answer(editor,ans_list){
	editor.focus();
	var positionSelection = editor.getSelection(); //On obtient la sélection de l'utilisateur
	if (positionSelection.length == 0){
		var name = window.prompt(Blockly.Msg.WIMS_PROMPT_ANSWER_NAME,Blockly.Msg.WIMS_PROMPT_ANSWER_NAME_PLACEHOLDER);

		if((name != null) && (test_valid_expression(name)) && (ans_list[name] == null)){
			ans_list[name] = new Answer(name,'numeric');
			ans_list[name].get_block_html().create_editor(); //on crée l'éditeur Quill
			//On ajoute la fonction qui permet de savoir quel éditeur est actif quand.
			ans_list[name].get_block_html().get_editor().editor.on('editor-change',
				function(){
					if( (active_editor_analyse != null) || (active_editor_analyse != ans_list[name].get_block_html().get_editor())){
						//REVOIR CE IF, IL VA PAS
						active_editor_analyse = ans_list[name].get_block_html().get_editor();}});
			//On rajoute la réponse à l'éditeur
			insert_embed_object(editor,positionSelection.index,'answerImage',name,editor.container.id);
		}
		else{
			window.alert(Blockly.Msg.WIMS_PROMPT_ANSWER_NAME_ERROR);
		}
	}
}

/** Fonction qui permet de tester si une chaine est composée uniquement de caractères alphanumériques
********* IN *************
** str : chaine de caractères à tester
*/
function test_valid_expression(str){
	var patt = /^[a-zA-Z][a-zA-Z0-9_]*$/;
	return patt.test(str);
}

/** Insertion d'un objet (variable, réponse) dans un éditeur quill
** sous forme de blot (Embed dans notre cas)
** Le passage des variables au blot se fait sous forme de chaine de car.
** transforme les variables en JSON et les passe au Blot.
********* IN *************
** editor : editeur quill concerné
** index : position d'insertion dans l'éditeur
** type : type d'objet et donc d'Embed
** value : valeur à afficher dans le blot
** variable1,2,3 : variables annexes à passer au blot (peuvent être des objets).
*/
function showCheckboxes() {
	var checkboxes = document.getElementById("checkboxes");
	if (!expanded) {
	  checkboxes.style.display = "block";
	  expanded = true;
	} else {  
	  checkboxes.style.display = "none";
	  expanded = false;
	}
  }

  function selectOnlyThis(id) {
    for (var i = 1;i <= 2; i++){
		if ("enterIndexCheckOption" + i === id && document.getElementById("enterIndexCheckOption" + i).checked === true)
		{
			document.getElementById("enterIndexCheckOption" + i).checked = true;
            } else {
			  document.getElementById("enterIndexCheckOption" + i).checked = false;	  
            }
    }  
}

function displayCheckboxOptions(element,object)
{
	element.style.display='block';
    object.setAttribute("data-checked","true");
}

function hideCheckoboxOptions(element,object)
{
	element.style.display='none';
    object.setAttribute("data-checked","false");
}

function validateInput(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode === 8 || event.keyCode === 46) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    } else {
        return true;
    }
};

  function displayBlock(object)
  {	
	selectOnlyThis(object.id);
	var enterIndexDivVisible = document.getElementById("enterIndexCheckOption1").getAttribute("data-checked");
	var enterRangeDivVisible = document.getElementById("enterIndexCheckOption2").getAttribute("data-checked");
	var checkBoxOneOptions = document.getElementById("level1");
	var checkBoxTwoOptions = document.getElementById("level2");

	switch(object.id)
	{
		case  "enterIndexCheckOption1" :
		{
			enterRangeDivVisible == "true"?hideCheckoboxOptions(checkBoxTwoOptions,document.getElementById("enterIndexCheckOption2")):null;
			enterIndexDivVisible=="false"?displayCheckboxOptions(checkBoxOneOptions,object):hideCheckoboxOptions(checkBoxOneOptions,object);
			break;
		}
		case "enterIndexCheckOption2":
		{
	
		enterIndexDivVisible == "true"?hideCheckoboxOptions(checkBoxOneOptions,document.getElementById("enterIndexCheckOption1")):null;
		enterRangeDivVisible=="false"?displayCheckboxOptions(checkBoxTwoOptions,object):hideCheckoboxOptions(checkBoxTwoOptions,object);
		break;
			
		}
	}

	  
  }

  function createQuillEditors()
  {
	var quill = new Quill("#quill-editor", {
		modules: {
		  toolbar: {
			container: "#quill-editor-toolbar",
			handlers: {
			  "emailVars": this.emailVars
			}
		  }
		},
		theme: 'snow'
	  });
	  return quill;
}

function emailVars(args) {
	const value = args[0]
	const cursorPosition = this.quill.getSelection().index
  
	if (value == 1) {
	  this.quill.insertText(cursorPosition, "{AccountURL}")
	} else if (value == 2) {
	  this.quill.insertText(cursorPosition, "{FirstName}")
	} else if (value == 3) {
	  this.quill.insertText(cursorPosition, "{Login}")
	} else if (value == 4) {
	  this.quill.insertText(cursorPosition, "{OrganizationName}")
	} else if (value == 5) {
	  this.quill.insertText(cursorPosition, "{SupportEmail}")
	} else {
	  this.quill.insertText(cursorPosition, "Please add an email variable.")
	}
  
	this.quill.setSelection(cursorPosition + value.length)
  }

function PreviewHTML() {
	const txtArea = document.createElement('textarea')
	txtArea.style.cssText = "width: 100%;margin: 0px;background: rgb(29, 29, 29);box-sizing: border-box;color: rgb(204, 204, 204);font-size: 15px;outline: none;padding: 20px;line-height: 24px;font-family: Consolas, Menlo, Monaco, &quot;Courier New&quot;, monospace;position: absolute;top: 0;bottom: 0;border: none;display:none"
  
	const htmlEditor = this.quill.addContainer('ql-custom')
	htmlEditor.appendChild(txtArea)
  
	const selfQuill = this.quill
	const myEditor = document.querySelector('#quill-editor')
  
	this.quill.on('text-change', function(delta, oldDelta, source) {
	  const text = selfQuill.root.innerHTML
	  const html = myEditor.children[0].innerHTML
  
	  txtArea.value = html
	  document.querySelector('.quill-text-output').innerText = text
	  document.querySelector('.quill-html-output').innerHTML = html
	})
  }

function create_varaibles_dropdown_selector(id){

	var datalist = document.getElementById("data-list");
	var options = "<option> Select variable </option>";
	for(var key in variable_List)
	{
		 let variable = variable_List[key];
		 options+=`<option>${variable.name}</option>`;
	}
	datalist.innerHTML= options;
	return datalist;
  }

function insert_embed_object(editor,index,type,value,variable1,variable2,variable3) 
{
	
	console.log("app.js line 223 insert_embed_object");
	let DOMform = document.getElementById("selectForm");
	if(DOMform!=null)
	{
		
		document.getElementById("selectForm").remove();
	}
	
	var transferVar;
	
	// If variables 1..3 not defined, behave like normal, send only value
	if (typeof variable1=='undefined' && typeof variable2=='undefined' && typeof variable3=='undefined') {
		transferVar = value;
	}	else {
		transferVar = JSON.stringify({'value':value,'variable1':variable1,'variable2':variable2,'variable3':variable3});
	}
	let currentVariable = variable_List[value];
	if(currentVariable!=undefined && currentVariable.type=="matrix")
	{
	window.transferVar = transferVar;
	window.editor = editor;
	let customEditor = editor.options.container;
	let node = document.createElement("div");
	node.style.display = 'ql-editor';
	node.id="selectForm";
	node.classList.add("form-control");
	let html = '<div class="multiselect">';
	let options = `<div class="selectBox" onclick="showCheckboxes()">
					 <select id="checkBoxSelect">
					   <option>Select an option</option>
					 </select>
				     <div class="overSelect"></div>
				   </div>
				   <div id="checkboxes">
				    <div id="optionOne">
				     <label for="enterIndexCheckOption1" style="width:100%"><input type="checkbox"  onclick="displayBlock(this)"  id="enterIndexCheckOption1" data-checked="false"/>Select one element</label>
				      <div id="level1" style="display:none;">
					    <label class="inner-label">Enter index : </label>
						<input id="varIndex" type="input" class="inner-input" onkeypress="return validateInput(event)"></input>
						<div id="editor-container"></div>
						<input type="text" list="data-list"></input>
						<datalist id="data-list"></datalist>
						<button id="indexButton" onclick="modifyVarible()">Submit</button>					
					  </div>
					 </div>
					 <label for="enterIndexCheckOption2" style="width:100%"><input type="checkbox" id="enterIndexCheckOption2" onclick="displayBlock(this)" data-checked="false"/>Select range</label>
					   <div id="level2" style="display:none">
					     <div id="indexes">
					        <label class="inner-label">Enter begin index : </label>
							<input style="display:inline;width:30px;height:20px;" type="text"></input>
							<br>
						    <label class="inner-label">Enter end index : </label>
                            <input class="inner-input" type="text"></input>
						 </div>
						 <div id="endIndex">
						    <label class="inner-label">From start to index : </label>
                            <input class="inner-input" type="text"></input>
						 </div>
						 <div id="beginIndex">
							 <label class="inner-label">From selected index to end : </label>	
							 <div id="quill-editor-toolbar">
                                <select class="ql-emailVars">
                                   <option value="1">Email</option>
                                   <option value="2">Email2</option>
                                   <option value="3">Email3</option>
                                   <option value="4">Emai4</option>
                                   <option value="5">Email</option>
                                </select>
                              </div>
                              <div id="quill-editor"></div>			
					     </div>
					   </div>
				   </div>`;
	html+=options;
	html+='</div>';
	node.innerHTML = html;
	customEditor.appendChild(node);	
   // create_varaibles_dropdown_selector("toolbar-container");
//	seEditor = createQuillEditors("editor-container");
    createQuillEditors();
	PreviewHTML();
		
	}
	editor.insertEmbed(index,type,transferVar);	 
}


function addNewVarible()
{

	seEditor.insertEmbed(0,"VariableImage","nnn");

}





function modifyVarible()
{
	
	let transferVar = window.transferVar;
	let editor = window.editor;
	const variableIndex = document.getElementById("varIndex").value;

	if(variableIndex.trim()!="")
	{
		let modEditor = editor.container;
		let qlEditor = modEditor.getElementsByClassName("ql-editor");
		let paragraph = qlEditor[0].getElementsByTagName("p");
		let spans = paragraph[0].getElementsByTagName("span");	
		Array.from(spans).forEach(span => {
			const dataValue = span.getAttribute("data-value");
			if(dataValue==`${transferVar}`)
			{
				transferVar+=`[${variableIndex}]`;
				span.innerText=`${transferVar}`;
				span.setAttribute("data-value",`${transferVar}`);
			}
			
		})
	}

}



/** Fonction qui permet de créer la variable avec les paramètres du popup de création de variable
********* IN *************
** id_select_type_popup : id du select du popup d'où tirer les informations
** id_input_name_popup : id du popup d'où tirer les informations
** index : endroit où insérer la variable dans l'éditeur
*/
function create_variable_editor(id_select_type_popup,id_input_name_popup,index){
	console.log("app.js line 237 create_variable_editor");
	//On récupère le type de la variable_List
	var type = document.getElementById(id_select_type_popup).options[document.getElementById(id_select_type_popup).selectedIndex].value;
	//On récupère le nom de la variable
	var name = document.getElementById(id_input_name_popup).value;
	if(test_valid_expression(name)){
		console.log("app.js line 246 create_variable_editor");
		//On insère la variable dans l'éditeur sous la forme d'un Embed
		insert_embed_object(quill,index,'VariableImage',name);
		if (variable_List[name] == null){ //Si la variable n'existe pas encore
			variable_List[name] = new Variable(name,type); //On ajoute la nouvelle variable à notre liste de variable
			variable_List[name].init();
			update_variables_view("card_Enonce_Variable",variable_List); //On met à jour l'affichage ds variables
			update_all_view();
			jQuery('#popup').toggleClass('popup_variable_visible');//On désactive le popup
			add_blockly_variable(name);
		}
	}
	else{
		window.alert(Blockly.Msg.WIMS_PROMPT_VARIABLE_NAME_ERROR);
	}
}

/** Fonction qui permet de créer une variable à partir d'une sélection d'un éditeur
** ou de créer un popup s'il n't a pas de selection dans l'éditeur
********* IN *************
** editor : l'éditeur à regarder pour voir la sélection et ajouter la variable
** var_list : liste de variables où ajouter la variable nouvellement créer
*/
function change_to_var(editor,var_list){
	console.log("app.js line 266 change_to_var");
	editor.focus();
	var positionSelection = editor.getSelection(); //On obtient la sélection de l'utilisateur
	if (positionSelection.length == 0){
		//Ajouter un popup pour créer directement la variable
		create_variable_choice_popup("variable_creation_button",positionSelection.index);
	}
	else{
		var nameVar = editor.getText(positionSelection.index,positionSelection.length); //On récupère le contenu de la sélection
		if (test_valid_expression(nameVar)){
			editor.deleteText(positionSelection.index,positionSelection.length); //On enlève le texte séléctionné
			insert_embed_object(editor,positionSelection.index, 'VariableImage',nameVar); //On le remplace par Variable possédant le nom que l'utilisateur avait sélectionné
			if (var_list[nameVar] == null){
				var_list[nameVar] = new Variable(nameVar,'real');
				var_list[nameVar].init();
				update_variables_view("card_Enonce_Variable",var_list);
				update_all_view();
				add_blockly_variable(nameVar);
			}
		}
		else{
			window.alert(Blockly.Msg.WIMS_PROMPT_VARIABLE_NAME_ERROR)
		}
	}
}

 /** Fonction qui permet de changer le type d'une réponse
 ********* IN *************
 ** id_answer : id de la réponse à changer
 ** type : le type que l'on veut attribuer à la réponse
 ** ans_list : la liste de réponse où aller chercher celle que l'on veut
 */
function change_type_answer(id_answer,type,ans_list){
	console.log("app.js line 303 change_type_answer");
 	ans_list[id_answer].get_block_html().change_to_type(type);
	ans_list[id_answer].type = type;
}

/** Fonction qui permet de détruire une réponse
********* IN *************
** name : le nom de la réponse à détruire
*/
function delete_element_answer_list(name){
	answer_List[name].get_block_html().destroy();
	delete answer_List[name];
}

/** Fonction qui permet de replacer les réponses dans le bon ordre dans l'onglet analyse
** si elles ont changés de place dans l'énoncé ou les détruire si elles n'existent plus dans l'énoncé
********* IN *************
** editor : l'éditeur que l'on va regarder pour savoir dans quelle ordre sont nos réponses
** ans_list : la liste des réponses à replacer correctement
*/
function update_analyse_answer(editor,ans_list){
	console.log("app.js line 324 update_analyse_answer");
	var tab_answer = editor.get_answer_tab(); //On obtient le tableau des réponses dans l'énoncé dans l'ordre
	var pos;//on initialise notre position courante
	for(var key in ans_list){
		pos = tab_answer.indexOf(key);//On obtient la position de la réponse que l'on regarde
		if(pos != -1){ //si cette réponse est encore valide
			//On l'ajoute au bon endroit
			if(pos > 0){
				jQuery('#answer_list_analyse .callout').eq(pos-1).after(jQuery('#answer_all_'+key));
			}
			else{
				jQuery('#answer_list_analyse .callout').eq(0).before(jQuery('#answer_all_'+key));
			}
		}
		else{
			delete_element_answer_list(key);
		}
	}
}

/** Fonction qui permet de donner l'éditeur qui a le focus dans l'onglet analyse
********* OUT *************
** result : l'éditeur qui a le focus
*/
function get_active_editor_analyse(){
	console.log("app.js line 349 get_active_editor_analyse");
	var result = null;
	for(var key in answer_List){
		//On parcours tous les éditeurs et on regarde celui qui a le focus
		if(answer_List[key].get_block_html().get_editor().editor.hasFocus()){
			result = answer_List[key].get_block_html().get_editor();
		}
	}
	return result;
}

/** Fonction qui permet de détruire toutes traces de la réponse donnée dans tous les éditeurs quill
********* IN *************
** name : le nom de la réponse à détruire dans les éditeurs
*/
function destroy_answer(name){
	delete_element_answer_list(name);
	editor_Enonce.destroy_answer(name);
	for(var key in answer_List){
		answer_List[key].get_block_html().get_editor().destroy_answer(name);
	}
}

/** Fonction qui permet de créer la liste des '<li>' de toutes les variables que l'on affiche à droite dans l'énoncé
********* IN *************
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
********* OUT *************
** result : la chaine des '<li>'
*/
function create_list_variables(variable_list){
	console.log("app.js line 379 create_list_variables");
	var result = "";
	for(var key in variable_list){
		console.log("app.js line 389 create_lis_variables : "+key);
		result += '<li style="margin-bottom:5px;position:relative;"><span class="surligne_Variable" onclick="editor_Enonce.add_variable(\''+key+'\');">'+key+'</span><button id="button_destroy_'+key+'" class="close-button" aria-label="Close alert" type="button" style="float:right;clear:right;font-size:1.6em;top:0px;" onclick="destroy_variable(\''+key+'\');update_all_view();"><span aria-hidden="true">&times;</span></button></li>'
	}
	return result;
}

/** Fonction qui permet de créer la liste des '<li>' de toutes les variables que l'on affiche à droite dans l'analyse
********* IN *************
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
********* OUT *************
** result : la chaine des '<li>'
*/
function create_list_variables_analyse(variable_list){
	console.log("app.js line 394 create_list_variables_analyse");
	var result = "";
	for(var key in variable_list){
		console.log("app.js line 405 create_list_variables_analyse : "+ key);
		result += '<li style="margin-bottom:5px;position:relative;"><span class="surligne_Variable" onclick="active_editor_analyse.add_variable(\''+key+'\');">'+key+'</span><button id="button_destroy_'+key+'" class="close-button" aria-label="Close alert" type="button" style="float:right;clear:right;font-size:1.6em;top:0px;" onclick="destroy_variable(\''+key+'\');update_all_view();"><span aria-hidden="true">&times;</span></button></li>'
	}
	return result;
}

/** Fonction qui permet de créer la liste des '<li>' de toutes les réponses que l'on affiche à droite dans l'énoncé
********* IN *************
** answer_tab: la liste des réponses d'où l'on crée notre liste de '<li>'
********* OUT *************
** result : la chaine des '<li>'
*/
function create_list_answer(answer_tab){
	var result = "";
	for(var  key in answer_tab){
		result += '<li style="margin-bottom:5px;position:relative;"><span class="surligne_Answer" onclick="active_editor_analyse.add_answer(\''+key+'\');">'+key+'</span><button id="button_destroy_'+key+'" class="close-button" aria-label="Close alert" type="button" style="float:right;clear:right;font-size:1.6em;top:0px;" onclick="destroy_answer(\''+key+'\');update_all_view();"><span aria-hidden="true">&times;</span></button></li>'
	}
	return result;
}

/** Fonction qui permet de créer la liste des '<li>' de toutes les variables que l'on affiche à droite dans la préparation
********* IN *************
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
********* OUT *************
** result : la chaine des '<li>'
*/
function create_list_var_prep(variable_list){
	console.log("app.js line 423 create_list_var_prep");
	var result = "";
	for(var key in variable_list){
		console.log("app.js line 423 create_list_var_prep : "+JSON.stringify(key));
		result += '<li style="margin-bottom:5px;position:relative;"><span class="surligne_Variable" onclick="add_variable_editor_blockly(event,\''+key+'\');">'+key+'</span><button id="button_destroy_'+key+'" class="close-button" aria-label="Close alert" type="button" style="float:right;clear:right;font-size:1.6em;top:0px;" onclick="destroy_variable(\''+key+'\');update_all_view();"><span aria-hidden="true">&times;</span></button></li>'
	}
	return result;
}

/** Fonction qui permet de mettre à jour les listes de variables qui s'affichent dans l'énoncé et l'analyse
********* IN *************
** id_to_updt: id de l'élement HTML à mettre à jour
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
*/
function update_variables_view(id_to_updt, variable_list){
	console.log("app.js line 437 update_variables_view");
	var result = "";
	result = "<ul class='variable_List_Enonce'>"+create_list_variables(variable_list)+"</ul>";
	document.getElementById(id_to_updt).innerHTML = result;
}

/** Fonction qui permet de mettre à jour les listes de variables qui s'affichent dans la préparation
********* IN *************
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
*/
function update_variables_prep_view(variable_list){
	console.log("app.js line 448 update_variables_prep_view");
	var result ="";
	result = "<ul class='variable_List_Enonce'>"+create_list_var_prep(variable_list)+"</ul>";
	document.getElementById('card_Prep_Variable').innerHTML = result;
}

/** Fonction qui permet de mettre à jour les listes de variables qui s'affichent dans l'analyse
********* IN *************
** id_to_updt: id de l'élement HTML à mettre à jour
** variable_list: la liste des variables d'où l'on crée notre liste de '<li>'
** answer_tab: la liste des réponses d'où l'on crée notre liste de '<li>'
*/
function update_variables_answers_view(id_to_updt,variable_list,answer_tab){
	var result = "";
	result = "<ul class='variable_List_Enonce'>"+create_list_variables_analyse(variable_list)+create_list_answer(answer_tab)+"</ul>";
	document.getElementById(id_to_updt).innerHTML = result;
}

/** fonction pour mettre à jour toutes les vues de variables dans l'énoncé, la préparation et l'analyse
*/
function update_all_view(){
	console.log("app.js line 469 update_all_view");
	update_variables_view('card_Enonce_Variable',variable_List);
	update_variables_prep_view(variable_List);
	update_variables_answers_view('card_Analyse_Variable',variable_List,answer_List);
}

/** Fonction qui permet de récupérer toutes les infos de l'en-tête et de l'énoncé
********* OUT *************
** all_info : an associative array with all the informations
*/
function gather_all_info(){
	console.log("app.js line 480 gather_all_info");
	var all_info = {};
	//We get all the interesting infos where we have to
	all_info["title"] = document.getElementById("title_EnTete").value;
	all_info["language"] = document.getElementById("language_EnTete").value;
	all_info["name"] = document.getElementById("name_EnTete").value;
	all_info["firstName"] = document.getElementById("firstName_EnTete").value;
	all_info["email"] = document.getElementById("email_EnTete").value;
	all_info["OEF_code"] = editor_EnTete.to_OEFcode();
	all_info["enonce"] = editor_Enonce.to_OEFcode();
	return all_info;
}

/** Fonction qui permet de créer le popup pour créer une variable sans sélection
********* IN *************
** id_to_popup: id de l'élement à côté duquel le popup va apparaitre
** index : l'endroit où l'on va créer la variable dans l'éditeur
*/
function create_variable_choice_popup(id_to_popup,index){
	console.log("app.js line 499 create_variable_choice_popup");
	var rect = document.getElementById(id_to_popup).getBoundingClientRect(); //On obtient la position du bouton var
	jQuery('#popup').toggleClass('popup_variable_visible');//On active le popup
	jQuery('#popup').addClass('large-3');
	jQuery('#popup').addClass('columns');
	//On place le popup là ou il faut
	jQuery('#popup').css({'top':rect.top + ((rect.bottom - rect.top)/2),'left':rect.left + ((rect.right - rect.left)/1.3), 'position':'absolute'});
	//On crée le contenu du popup
	document.getElementById("popup").innerHTML = '<div class="callout"><label>Variable type'
  +'<select id = "popup_select">'
    +'<option value="Real">Real</option>'
    +'<option value="Draw">Draw</option>'
    +'<option value="Fun">Function</option>'
    +'<option value="Int">Integer</option>'
  +'</select>'
+'</label>'
+'<input placeholder="'+Blockly.Msg.WIMS_POPUP_VARIABLE_NAME_PLACEHOLDER+'" type="text" id="popup_input"></input>'
+'<a href="#" class="button" onclick="create_variable_editor(\'popup_select\',\'popup_input\','+index+')">'+Blockly.Msg.WIMS_POPUP_VARIABLE_BUTTON_CREATE+'</a>'
+'</div>'
}

/** Fonction qui permet de détruire une variable
********* IN *************
** name : le nom de la variable qui doit disparaitre
*/
function destroy_variable(name){
	console.log("app.js line 525 destroy_variable");
	delete_blockly_variable(name);
	delete variable_List[name];
	editor_Enonce.destroy_var(name);
	for(var key in answer_List){
		answer_List[key].get_block_html().get_editor().destroy_var(name);
	}
	for(var i = 0; i<Blockly.ExternalDiv.owner.length;i++){
		var tmpEditor = new SEditor(Blockly.ExternalDiv.owner[i].quillEditor_);
		tmpEditor.destroy_var(name);
	}
}

/** Fonction qui permet de créer la chaine de caractère caractérisant les réponses dans un éditeur OEF
********* IN *************
** answer : la réponse d'on l'on veut le bon code OEF
********* OUT *************
** result : la chaine de caractères qui représente le code OEF
*/
function create_answer_OEF(answer){
	var result = "\\answer{}";
	result += "{"+answer.to_OEF()+"}";
	result += "{type="+answer.get_type()+"}";
	result += answer.get_option();
	return result;
}

/** Fonction qui permet de créer toutes les chaines de caractères caractérisant les réponses dans un éditeur OEF
********* OUT *************
** result : la chaine de caractères qui représente le code OEF
*/
function get_all_answer_OEF(){
	var result = "";
	for (var i = 0;i<Object.keys(answer_List).length;i++){
		result += create_answer_OEF(answer_List[jQuery('#answer_list_analyse .callout').get(i).id.substring(11)]) + "\n";
	}
	return result;
}

/** Fonction qui permet de créer le code OEF final
*/
function update_final_code(){
	var result = "";
	var infos = gather_all_info();
	/* HEAD DU CODE */
	if(infos.title == ''){
		result += "\\title{Exercice}\n";
	}
	else{
		result += "\\title{"+infos.title+"}\n";
	}
	result += "\\language{"+infos.language+"}\n";
	if(infos.firstName == '' && infos.name == ''){
		result += "\\author{}\n";
	}
	else{
		result += "\\author{"+infos.firstName+","+infos.name+"}\n";
	}
	result += "\\email{"+infos.email+"}\n";
	result += "\\computeanswer{no}\n";
	result += "\\format{html}\n";
	result += "\\precision{1000}\n";
	result += "\\range{-5..5}";
	result += "\n"
	result += infos.OEF_code
	result += "\n"
	/*DEBUT DU CODE EN SOI*/
	result += generate_prep_code() + '\n';
	result += "\\statement{\n";
	/* RAJOUTER LE CODE TRANSFORMé DE L'ONGLET ENONCE */
	result += infos.enonce;
	/*ON FERME LE DOCUMENT */
	result += "}\n";
	result += get_all_answer_OEF()+'\n';
	result += generate_analyse_code();
	document.getElementById("final_OEF_code").value = result;
}

/** Fonction qui permet d'ajouter une variable à un workspace Blockly
********* IN *************
** name : le nom de la variable que l'on veut ajouter
*/
function add_blockly_variable(name){
	console.log("app.js line 592 add_blockly_variable");
	console.log("app.js line 619 : "+name);
	prepEditor.mBlocklyWorkspace.createVariable(name);
	analyseEditor.mBlocklyWorkspace.createVariable(name);

}

/** Fonction qui permet de supprimer une variable d'un workspace Blockly
********* IN *************
** name : le nom de la variable à enlever du Blockly
*/
function delete_blockly_variable(name){
	// Call only the Blockly destructors
	prepEditor.mBlocklyWorkspace.deleteVariable_orig.call(prepEditor.mBlocklyWorkspace,name);
	analyseEditor.mBlocklyWorkspace.deleteVariable_orig.call(analyseEditor.mBlocklyWorkspace,name);
}

/** Fonction qui permet d'ajouter une variable dans un éditeur quill coincé dans un Blockly
********* IN *************
** name : le nom de la variable à ajouter
*/
function add_variable_editor_blockly(event,name){
	console.log("app.js line 613 add_variable_editor_blockly");
	var monDiv = Blockly.ExternalDiv.activeDivId;
	var index = -1;
	if(monDiv){
		for(var i = 0;i<Blockly.ExternalDiv.DIV.length;i++){
			if(Blockly.ExternalDiv.DIV[i].id == monDiv){
				index = i;
			}
		}
		var tmp = new SEditor(Blockly.ExternalDiv.owner[index].quillEditor_);
		tmp.add_variable(name);
	}
}

/** Fonction qui permet d'ajouter une variable dans un éditeur quill d'un bloc answer
********* IN *************
** name : le nom de la variable à ajouter
*/
function add_variable_editor_answer(event,name){
	console.log("app.js line 632 add_variable_editor_answer");
	var monDiv = AnswerBlock.activeEditorId;
	console.log(monDiv);
	if(monDiv){
		if (AnswerBlock.activeBlock) {
			var tmp = new SEditor(AnswerBlock.activeBlock.editor.editor);
			tmp.add_variable(name);
		}
	}
	event.stopPropagation();
}

/** Fonction qui permet d'ajouter une réponse dans un éditeur quill coincé dans un Blockly
********* IN *************
** name : le nom de la réponse à ajouter
*/
function add_answer_editor_blockly(event,name){
	console.log("app.js line 649 add_answer_editor_blockly");
	var monDiv = Blockly.ExternalDiv.activeDivId;
	var index = -1;
	if(monDiv){
		for(var i = 0;i<Blockly.ExternalDiv.DIV.length;i++){
			if(Blockly.ExternalDiv.DIV[i].id == monDiv){
				index = i;
			}
		}
		var tmp = new SEditor(Blockly.ExternalDiv.owner[index].quillEditor_);
		tmp.add_answer(name);
	}
}

/** Fonction qui permet de génerer le code du Blockly de préparation
********* OUT *************
** code : le code OEF final du Blockly
*/
function generate_prep_code(){
	console.log("app.js line 684 generate_prep_code");
	Blockly.OEF.addReservedWords('code');
	var code = Blockly.OEF.workspaceToCode(prepEditor.mBlocklyWorkspace);
	return code;
}

/** Fonction qui permet de génerer le code du Blockly d'analyse
********* OUT *************
** code : le code OEF final du Blockly
*/
function generate_analyse_code(){
	Blockly.OEF.addReservedWords('code');
	var code = Blockly.OEF.workspaceToCode(analyseEditor.mBlocklyWorkspace);
	return code;
}

/** Fonction qui permet de génerer la liste des variables à ajouter au popup pour les quill dans Blockly
********* IN *************
** destinationType : type de block où se trouve l'éditeur, "answer" ou "blockly"
********* OUT *************
** result : la liste html des variables à implémenter dans le popup
*/


function create_unordered_list_var (destinationTypeFunc)
{
	var result = '<ul style="margin-left:5px;">';
	for(var key in variable_List)
	{
		result += '<li style="margin-bottom:5px;position:relative;list-style: none;">'+
					'<span class="surligne_Variable" style="font-size:0.7em;" onclick="'+destinationTypeFunc+'(event,\''+key+'\');">'+key+'</span>'+
				 '</li>';	 
	}
	result += '</ul>';
	return result;	
}

function generate_list_var_popup(destinationType)
{
	console.log("app.js line 715 generate_list_var_popup");
	 var destinationTypeFunc = 'add_variable_editor_blockly';
	 if (destinationType == 'answer') {
		 destinationTypeFunc = 'add_variable_editor_answer';
	 }
	
	//  var objectsToRender = [];
	//  var code = Blockly.OEF.workspaceToCode(prepEditor.mBlocklyWorkspace);
	//  var splitted  = code.split('\\');
	//  splitted.forEach(element => {
	// 	 var currentValue = element.substring(
	// 		element.lastIndexOf("{") + 1, 
	// 		element.lastIndexOf("}")
	// 	);
	// 	if(currentValue.trim()!=='')
	// 	{
	// 	 var curVal = currentValue.split("=");
	// 	 var variableName = curVal[0];
	// 	 var variableValue = curVal[1];
	// 	 var objectToRender = {};
	// 	 objectToRender.name = variableName;
	// 	 objectToRender.value = variableValue;
	// 	 objectsToRender.push(objectToRender);
	// 	}
	//  });
	//  var result = '<ul style="margin-left:5px;">';
	//  for(var key in variable_List)
	//  {
	// 	 result +=             '<li style="margin-bottom:5px;position:relative;list-style: none;">'+
	// 	 							'<span class="surligne_Variable" style="font-size:0.7em;" onclick="'+destinationTypeFunc+'(event,\''+key+'\');">'+key+'</span>'+
	// 							'</li>';	 
	//  }
	//  result += '</ul>';
	//  return result;
	return create_unordered_list_var(destinationTypeFunc);
}

/** Fonction qui permet de génerer la liste des variables et des réponses à ajouter au popup pour les quill dans Blockly
********* OUT *************
** result : la liste html des variables et des réponses à implémenter dans le popup
*/
function generate_list_var_answer_popup(){
	 var result = '<ul style="margin-left:5px;">';
	 for(var key in variable_List){
		 result += '<li style="margin-bottom:5px;position:relative;list-style: none;">'+
		 							'<span class="surligne_Variable" style="font-size:0.7em;" onclick="add_variable_editor_blockly(event,\''+key+'\');">'+key+'</span>'+
								'</li>';
	 }
	 for(var key in answer_List){
		 result += '<li style="margin-bottom:5px;position:relative;list-style: none;">'+
		 							'<span class="surligne_Answer" style="font-size:0.7em;" onclick="add_answer_editor_blockly(event,\''+key+'\');">'+key+'</span>'+
								'</li>';
	 }

	 result += '</ul>';
	 return result;
}

/** Fonction qui permet de changer le nom d'une variable
********* IN *************
** oldName : le nom actuel de la variable
** newName: le nouveau nom que l'on veut donner à la variable
*/
function changeAllNameVar(oldName,newName){
	editor_Enonce.changeNameVar(oldName,newName);
	editor_EnTete.changeNameVar(oldName,newName);
	for(var key in answer_List){
		answer_List[key].get_block_html().get_editor().changeNameVar(oldName,newName);
	}
	for(var i = 0; i<Blockly.ExternalDiv.owner.length;i++){
		var tmpEditor = new SEditor(Blockly.ExternalDiv.owner[i].quillEditor_);
		tmpEditor.changeNameVar(oldName,newName);
	}
}

/** Fonction qui permet de générer le popup pour séléctionner
** les variables et les réponses à ajouter dans un éditeur quill dans un Blockly
********* IN *************
** x : l'emplacement en abscisse du popup
** y: l'emplacement en ordonnée du popup
** withAnswer : boolean pour savoir si on ajoute les réponses ou non
*/
function generate_popup_list_var(divName,x,y,withAnswer){
	console.log("app.js line 768 generate_popup_list_var");
	var destinationType;
	switch (divName) {
		case 'popup_var_blockly':
			destinationType = 'blockly';
			break;
		case 'popup_var_answer':
			destinationType = 'answer';
			break;
		default:
			destinationType = 'blockly';
	}
	var maDiv = document.createElement('div');
	maDiv.id = divName;
	if(!withAnswer){
		maDiv.innerHTML = generate_list_var_popup(destinationType);
	}
	else{
		maDiv.innerHTML = generate_list_var_answer_popup();
	}
	maDiv.style.top = y+'px';
	maDiv.style.left = x+'px';
	maDiv.style.height = '150px';
	maDiv.style.padding = '1px 10px 1px 1px';
	maDiv.style.position = 'absolute';
	maDiv.style.cursor = 'pointer';
	maDiv.style.overflow = 'scroll';
	maDiv.style.backgroundColor = 'grey';
	if((Object.keys(variable_List).length == 0) && (Object.keys(answer_List).length == 0)){
		maDiv.style.visibility = 'hidden';
	}
	document.body.appendChild(maDiv);
}

/** Fonction qui permet de générer un JSON de l'état actuel de tous le site, les éditeurs, les Blockly etc..
********* OUT *************
** state : l'état de l'e'xercice en JSON
*/
function get_variables_JSON(){
	console.log("app.js line 806 get_variables_JSON");
//	var teststate = Blockly.Xml.workspaceToDom(prepEditor.mBlocklyWorkspace);
	var entete = gather_all_info();
	delete entete['enonce'];
	delete entete['OEF_code'];
	var state = {'enonce':editor_Enonce,
							'variables':variable_List,
							'answer':answer_List,
							'prep':Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(prepEditor.mBlocklyWorkspace)),
							'analyse':Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(analyseEditor.mBlocklyWorkspace)),
							'en_tete':entete,
							'editor_EnTete':editor_EnTete};
	function fun2(key,value){
 		if( key != 'editor' && key != 'all_type' && key != 'html' && key != 'mTypeDeclarationBlock') {
 			return value;
 		}
		if(key == 'editor'){
			return value.getContents();
		}
 	};
	document.getElementById('save_state').value = JSON.stringify(state,fun2,' ');
	return JSON.stringify(state,fun2,' ');
}

/** Fonction qui permet de parser une sauvegarde pour réprendre à l'état de la sauvegarde
********* IN *************
** save : la sauvegarde sous forme de JSON
*/
function parse_save(save){
	console.log("app.js line 835 parse_save");
	function reviver(key,value){
		if(key == 'editor'){
			return new SEditor(value);
		}
		else{
			return value;
		}
	}

	var state = JSON.parse(save,reviver);
	// clear variable list before loading blockly editors contents
	// some variables will be defined during the load (the loop indices mainly)
	variable_List = {};

	jQuery('#title_EnTete').get(0).value = state['en_tete']['title'];
	jQuery('#language_EnTete').get(0).value = state['en_tete']['language'];
	jQuery('#name_EnTete').get(0).value = state['en_tete']['name'];
	jQuery('#firstName_EnTete').get(0).value = state['en_tete']['firstName'];
	jQuery('#email_EnTete').get(0).value = state['en_tete']['email'];
	editor_EnTete.editor.setContents(state['editor_EnTete']['editor'].editor);
	editor_Enonce.editor.setContents(state['enonce']['editor'].editor);
	prepEditor.load(state['prep']);
	analyseEditor.load(state['analyse']);

	var ans_list_tmp = {};
	var res = {};
	for(var key in state['variables']){
		console.log("app.js line 874 : "+JSON.stringify(key));
		if (variable_List[key]) {
			// variable was already defined during the load of the Blockly editor
			// except for the type of variable
			variable_List[key].setType(state['variables'][key]['type']);
		} else {
			variable_List[key] = new Variable(state['variables'][key]['name'],state['variables'][key]['type']);
			// The following call will also define the variable in variable_List
			variable_List[key].init();
		}
	}

	// Set the type in all the Blockly type declaration fields
	for(var key in variable_List) {
		variable_List[key].setTypeInDeclaration();
	}

	jQuery('#answer_list_analyse').html('');
	for(var key in state['answer']){
		ans_list_tmp[key] = new Answer(state['answer'][key]['name'],state['answer'][key]['type']);
		ans_list_tmp[key].length = state['answer'][key]['length'];
		ans_list_tmp[key].get_block_html().create_editor();
		//On ajoute la fonction qui permet de savoir quel éditeur est actif quand.
		ans_list_tmp[key].get_block_html().editor.editor.setContents(state['answer'][key]['block_html']['editor'].editor);
		ans_list_tmp[key].get_block_html().change_to_type(state['answer'][key]['type']);
		if(state['answer'][key]['type'] == 'other'){
			jQuery('#ans_'+key+'_type textarea').val(state['answer'][key]['sub_type'])
		}
		jQuery('#answer_all_'+key).find('select').val(state['answer'][key]['type']);
		jQuery('#answer_all_'+key+' option[value='+state['answer'][key]['type']+']').attr('selected','selected');
	}
	answer_List = ans_list_tmp;

	// Remettre le signal "on editor-change" sur les éditeurs
	for(var key in state['answer']){
		answer_List[key].get_block_html().get_editor().editor.on('editor-change',
			function(){
				if( (active_editor_analyse != null) || (active_editor_analyse != answer_List[key].get_block_html().get_editor())){
				//REVOIR CE IF, IL VA PAS
					active_editor_analyse = answer_List[key].get_block_html().get_editor();}});
	}
}

/** Fonction qui permet de rajouter l'écouteur sur les éditeurs quill dans les Blockly lorsqu'on
** fait appel à la restore de sauvegarde
********* IN *************
** key : le nom de la réponse
*/
function editor_on_change_analysis(key){
	console.log("app.js line 911 editor_on_change_analysis");
	answer_List[key].get_block_html().get_editor().editor.on('editor-change',
		function(){
			if( (active_editor_analyse != null) || (active_editor_analyse != answer_List[key].get_block_html().get_editor())){
			// 	REVOIR CE IF, IL VA PAS
				active_editor_analyse = answer_List[key].get_block_html().get_editor();
			}
	});
}

/** Fonction qui permet de lancer la restauration depuis la dernière sauvegarde
*/
function use_save_state(){
	console.log("app.js line 924 use_save_state");
	parse_save(document.getElementById('save_state').value);
}

/** Fonction qui permet de récupérer un éditeur quill
** et de le transformer en SEditor à partir de l'ID d'un fieldWIMSEditor
********* IN *************
** id_field_WIMS : l'id de la div à récupérer
*/
function get_editor_field_wims(id_field_WIMS){
	console.log("app.js line 934 get_editor_field_wims");
	var index = -1;
	for(var i = 0;i<Blockly.ExternalDiv.DIV.length;i++){
		if(Blockly.ExternalDiv.DIV[i].id == id_field_WIMS){
			index = i;
		}
	}
	if(index != -1){
		var editorTmp = new SEditor(Blockly.ExternalDiv.owner[index].quillEditor_);
		return editorTmp;
	}
	else{
		console.log('get_editor_field_wims() error, no index found');
		return null;
	}
}

/** Fonction qui permet de créer un popup et de l'afficher en dessous de la réponse
** qui a recu le click
********* IN *************
** id_element : l'id de l'AnswerImage où l'on doit afficher le popup
** answer_name : le nom de la réponse
*/
function create_popup_embed_answer(id_element,answer_name){
	console.log("app.js line 958 create_popup_embed_answer");
	var textHtml = 'Entrez la taille que vous souhaitez pour votre réponse (par défaut 10):'+
									'<textarea id="popup_textarea_'+answer_name+'" placeholder="length..."></textarea>'+
									'<a class="button tiny" onclick=\'change_length_answer_via_popup(\"'+answer_name+'\")\'>Valider</a>';
	var length = document.getElementById(id_element).getBoundingClientRect();
	jQuery('#popup').html(textHtml);
	jQuery('#popup_textarea_'+answer_name).get(0).value = answer_List[answer_name].length;
	jQuery('#popup').css('height','150px');
	jQuery('#popup').css('position','fixed');
	jQuery('#popup').css('width','230px');
	jQuery('#popup').css('font-size','0.7em');
	jQuery('#popup').css('z-index','9000');
	jQuery('#popup').css('background-color','white');
	jQuery('#popup').addClass('callout');
	jQuery('#popup').css('top',(length.top+20)+'px');
	jQuery('#popup').css('left',(length.left-5)+'px');
	jQuery('#popup').toggleClass('popup_variable_visible');
}

/** Fonction qui permet de génerer un id unique pour chaque answerImage des éditeurs quill
********* IN *************
** name : le nom de la réponse
*/
function generate_unique_id_answer(name){
	var valid_id = false;
	var tmpId = '';
	var i = 1;
	while(!valid_id){
		tmpId = name + i;
		if(document.getElementById(tmpId) == null){
			valid_id = true;
		}
		else{
			i++;
		}
	}
	return tmpId;
}

/** Fonction qui permet de mettre à jour la longueur d'une réponse en utilisant les données du popup
********* IN *************
** answer_name : le nom de la réponse
*/
function change_length_answer_via_popup(answer_name){
	var length = jQuery('#popup_textarea_'+answer_name).get(0).value;
	answer_List[answer_name].length = length;
	jQuery('#popup').toggleClass('popup_variable_visible');
}

/** Fonction qui permet de cacher les éditeurs et les popups lors du changement d'onglet.
*/
function hide_popup(){
	Blockly.ExternalDiv.hide();
	jQuery('#popup').removeClass('popup_variable_visible');
}

function register_type_other(){
	for(var key in answer_List){
		if(jQuery('#answer_all_'+key+' select').val() == 'other'){
			answer_List[key].type = 'other';
			answer_List[key].set_sub_type(answer_List[key].get_type());
		}
	}
}
