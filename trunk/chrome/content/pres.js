//Image Download 
// version 1.0
//It is a Firefox Extension to download All the pictures in A Page
// Copyright (c) 2005, Filia Tao (gudu2005@gmail.com)
// Released under the GPL 2 license
// http://www.gnu.org/copyleft/gpl.html


var ImDoSetting =
{
	onLoad:
	function ()
	{
		//alert("enter ImDoSetting.onLoad in pres.js");
		//here show the old setting
		try
		{
			this.prefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('imdo.settings.');
		}
		catch(e) 
		{
		/*alert('fail to get preService in pres.js')*/
		}
		this.filter_width = document.getElementById("filter-width");
		this.filter_height = document.getElementById("filter-height");
		this.filter_type = document.getElementById("filter-type");
		this.category_list = document.getElementById("category-list");
		this.category = document.getElementById("category");
		this.dowload_folder = document.getElementById("download-folder");
		this.button_add = document.getElementById("add");
		try
		{
			var width = this.prefService.getIntPref('filter-width');
			var height = this.prefService.getIntPref('filter-height');
			var type = this.prefService.getCharPref('filter-type');
			var category = this.prefService.getComplexValue('category-list', Components.interfaces.nsISupportsString).data;
			//var category = this.prefService.getCharPref('category-list');
		}
		catch(e)
		{
			//alert(e.message);
		}
		this.filter_width.value = width?width:0;
		this.filter_height.value = height?height:0;
		this.filter_type.value = type?type:"";
		if (!category)
			category = "";
		category = category.split(',');
		for (var i = 0; i < category.length; i++)
		{
			if (category[i].length == 0)
				break;
			var a_category = category[i].split('|');
			var cell1=(document.createElement('listcell'));
			cell1.setAttribute('label',a_category[0] );
			var cell2=(document.createElement('listcell'));
			cell2.setAttribute('label',a_category[1] );
			var item = document.createElement('listitem');
			item.appendChild(cell1);
			item.appendChild(cell2);
			this.category_list.appendChild(item);
		}
	},
	onSave:
	function ()
	{
		//window.alert("onSave is called");
		var category="";
		for (var i = 0; i < this.category_list.getRowCount(); i++)
		{
			var item = this.category_list.getItemAtIndex(i);
			category += item.childNodes[0].getAttribute('label')+'|'+item.childNodes[1].getAttribute('label')+",";
		}

		try
		{
			this.prefService.setIntPref('filter-width',parseInt(this.filter_width.value) );
			this.prefService.setIntPref('filter-height',parseInt(this.filter_height.value) );
			this.prefService.setCharPref('filter-type',this.filter_type.value);
			var supportsStringInterface = Components.interfaces.nsISupportsString;
			var string = Components.classes["@mozilla.org/supports-string;1"].createInstance(supportsStringInterface);
			string.data = category;
			this.prefService.setComplexValue('category-list', supportsStringInterface, string);
			//this.prefService.setCharPref('category-list',category);
		}
		catch(e)
		{
		//	alert(e.message);
			//alert("error set the pre");
		};
		
	},
	onAdd:
	function ()
	{
		if (this.category.value==""||this.dowload_folder.value=="")
			return ;
		var cell1 = document.createElement('listcell');
		cell1.setAttribute('label',this.category.value);
		var cell2 = document.createElement('listcell');
		cell2.setAttribute('label',this.dowload_folder.value);
		var item = document.createElement('listitem');
		item.appendChild(cell1);
		item.appendChild(cell2);
		this.category_list.appendChild(item);
		this.category.value = "";
		this.dowload_folder.value ="";
		//alert("do onAdd");
	},
	onModify:
	function ()
	{
		this.select_item.childNodes[0].setAttribute('label',this.category.value);
		this.select_item.childNodes[1].setAttribute('label',this.dowload_folder.value);
		this.category.value = "";
		this.dowload_folder.value ="";
		//this.button_add.setAttribute('label',"&add.label;");
		this.button_add.setAttribute('command','Add');
	
		//alert("do onModify");
	},
	onItemDbclick:
	function ()
	{
		if (!this.category_list.selectedItem)
			return ;
		this.select_item = this.category_list.selectedItem;
		this.category.value = this.select_item.childNodes[0].getAttribute('label');
		this.dowload_folder.value = this.select_item.childNodes[1].getAttribute('label');
		//this.button_add.setAttribute("label","&modify.label;");
		this.button_add.setAttribute('command','Modify');
		this.category.select();
		//alert("do onItemDbclick");
	},
	onContextMenu:
	function ()
	{
		//alert("get into onContextMenu");
		this.select_item = this.category_list.selectedItem;
		if (!this.select_item)
		{
			//alert("no item is selected");
			return ;
		}
		var menu_popup = document.getElementById("context-menu");
		menu_popup.showPopup (this.select_item,-1,-1,"context");  
		
	},
	onExit:
	function ()
	{
		window.close();
	},
	onDelete:
	function ()
	{
		if (!this.select_item)
		{
		//	alert("no item is selected");
			return ;
		}
		this.category_list.removeItemAt(this.category_list.getIndexOfItem (this.select_item));
	},
	browseAndGetFolder:
	function ()
	{
		var nsIFilePicker = Components.interfaces.nsIFilePicker;
		var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
		fp.init(window, "", nsIFilePicker.modeGetFolder);
		var ret = fp.show();
		if (ret == nsIFilePicker.returnOK)
		{
			this.dowload_folder.value = fp.file.path;
		}
	}
}