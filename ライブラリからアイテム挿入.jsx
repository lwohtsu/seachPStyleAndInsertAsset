﻿var g_stylename = null;
var g_asset = null;
var g_inlinestyle = null;

main();
function main(){
	if (app.documents.length != 0){
		var myDocument = app.activeDocument;
		var selection = app.selection;
		if(selection.length<1) {
            	alert("ストーリー内にカーソルを置いてください");
            	return;
         }
		if(selection[0].constructor.name != 'InsertionPoint'){
             	alert("ストーリー内にカーソルを置いてください");
             	return;
         }
        var current = selection[0];
        //currentがStoryになるまで階層を登る（最大10ループ限定）
        for(var i=0; i<10; i++){
            	current = current.parent;
            	if(current.constructor.name == 'Story') break;
        }
        if(i>=10) {
             	alert("ストーリー内にカーソルを置いてください");
        	return;
        }
        //ダイアログ表示
        if(myDisplayDialog() == true){	
            searchAndInsert(current);
        }
	} else {
 	   alert ("ドキュメントを開いてください");
	}
}

function myDisplayDialog(){
	//文字スタイルの一覧を取得
	var myDocument = app.activeDocument;
	var stylenames = [];
	for(var i=0, l = myDocument.allParagraphStyles.length; i<l; i++){
		stylenames.push(myDocument.allParagraphStyles[i].name);
	}
    //ライブラリから一覧を取得
      var assets = [];
      var assetnames = [];
      for(var i = 0, ll = app.libraries.length; i< ll; i++){
          for(var j=0, al = app.libraries[i].assets.length; j<al; j++){
              assetnames.push( app.libraries[i].assets[j].name +  ' (' + app.libraries[i].name + ')');
              assets.push(app.libraries[i].assets[j]);
          }
      }    
	
	//ダイアログ生成
	var myDialog = app.dialogs.add({name:"Renban"});
	with(myDialog.dialogColumns.add()){
		//説明ラベル
		staticTexts.add({staticLabel:"特定の段落スタイルが設定された行にライブラリのアイテムを挿入します"});
		//パネルを追加
		with(borderPanels.add()){
			//ラベル
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"検索する段落スタイルを選択"});
			}
			//リストボックス
			with(dialogColumns.add()){
				var listboxParamStyle = dropdowns.add
					({stringList: stylenames, selectedIndex:0});
			}
		}
		//パネルを追加
		with(borderPanels.add()){
			//ラベル
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"挿入するライブラリのアイテムを選択"});
			}
			//リストボックス
			with(dialogColumns.add()){
				var listboxAssets = dropdowns.add
					({stringList: assetnames, selectedIndex:0});
			}
		}
		//パネルを追加
		with(borderPanels.add()){
			//ラベル
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"挿入後に設定する段落スタイルを選択"});
			}
			//リストボックス
			with(dialogColumns.add()){
				var listboxInlineStyle = dropdowns.add
					({stringList: stylenames, selectedIndex:0});
			}
		}    
	}
	
	myReturn = myDialog.show();
	if (myReturn == true){
		g_stylename = myDocument.allParagraphStyles[listboxParamStyle.selectedIndex];
		g_asset = assets[listboxAssets.selectedIndex];
        	g_inlinestyle = myDocument.allParagraphStyles[listboxInlineStyle.selectedIndex];
		myDialog.destroy();
		return true;
	} else {
		myDialog.destroy();
		return false;
	}		
}


function searchAndInsert(story){
	//前回の検索結果を消去
	app.findTextPreferences = NothingEnum.nothing;
	app.changeTextPreferences = NothingEnum.nothing;
	//検索条件を設定
	app.findChangeTextOptions.includeFootnotes = false;
	app.findChangeTextOptions.includeHiddenLayers = false;
	app.findChangeTextOptions.includeLockedLayersForFind = false;
	app.findChangeTextOptions.includeLockedStoriesForFind = false;
	app.findChangeTextOptions.includeMasterPages = false;
	app.findTextPreferences.findWhat = "\r";	//改行
	app.findTextPreferences.appliedParagraphStyle = g_stylename;	//文字スタイル
	//検索実行
	var findresult = story.findText();
	//連番挿入
	for(var i=findresult.length-1; i>=0; i--){
		var ip = findresult[i].insertionPoints[-1];//.lastItem();
        	g_asset.placeAsset(ip);
	    	ip.contents = '\r';
		ip.applyParagraphStyle(g_inlinestyle);
	}
	//検索結果を消去
	app.findTextPreferences = NothingEnum.nothing;
	app.changeTextPreferences = NothingEnum.nothing;
}
