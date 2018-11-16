var Variable = /** @class */ (function () {
    function Variable(name, type) {
        this.name = name;
        this.type = type;
        // Build and insert the type declaration block inside the
        // Blockly preparation editor
    }
    Variable.prototype.init = function () {
        console.log("Variable.js line : 9");
        if (!this.mTypeDeclarationBlock) {
            this.mTypeDeclarationBlock = prepEditor.mBlocklyWorkspace.newBlock('wims_change_type');
            this.mTypeDeclarationBlock.setFieldValue(this.name, "VARIABLE_CHOICE");
            this.mTypeDeclarationBlock.setDeletable(false);
            this.mTypeDeclarationBlock.setMovable(false);
            this.mTypeDeclarationBlock.initSvg();
            this.mTypeDeclarationBlock.render();
            var declarationBlocks = prepEditor.mDeclarationBlock.getChildren();
            if (declarationBlocks.length == 0) {
                var parentConnection = prepEditor.mDeclarationBlock.inputList[1].connection;
            }
            else {
                var previousBlock = declarationBlocks[0];
                while (previousBlock.getNextBlock()) {
                    previousBlock = previousBlock.getNextBlock();
                }
                var parentConnection = previousBlock.nextConnection;
            }
            var childConnection = this.mTypeDeclarationBlock.previousConnection;
            parentConnection.connect(childConnection);
            // update the type in this "variable" object
            // when changed in the dropdown menus
            var varTypeChanged = this;
            var typeDeclarationBlock = this.mTypeDeclarationBlock;
            this.mTypeDeclarationBlock.getField('TYPE').setValue(this.type);
            this.mTypeDeclarationBlock.setOnChange(function (changeEvent) {
                varTypeChanged.type = typeDeclarationBlock.getFieldValue('TYPE');
                // console.log("Variable.js change event : 35 : "+ varTypeChanged.type);
                // console.log(varTypeChanged);

            });
        }
    };
    Variable.prototype.getName = function () {
        return this.name;
    };
    Variable.prototype.getType = function () {
        return this.type;
    };
    Variable.prototype.getTypeDeclarationBlock = function () {
        return this.mTypeDeclarationBlock;
    };
    Variable.prototype.setType = function (type) {
        console.log("Variable.js line : 48");
        this.type = type;
        if (this.mTypeDeclarationBlock)
            this.setTypeInDeclaration();
    };
    Variable.prototype.setTypeInDeclaration = function () {
        console.log("Variable.js line : 54");
        this.mTypeDeclarationBlock.getField('TYPE').setValue(this.type);
    };
    Variable.prototype.getValue = function () {
        return this.value;
    };
    Variable.prototype.setValue = function (val) {
        console.log("Variable.js setValue line : 63 : "+val);
        this.value = val;
    };
    Variable.prototype.setName = function (name) {
        this.name = name;
    };
    Variable.prototype.toString = function () {
        return "Variable " + this.name + " of type " + this.type;
    };
    return Variable;
}());
