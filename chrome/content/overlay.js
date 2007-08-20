//Image Download 
// version 1.0
//It is a Firefox Extension to download All the pictures in A Page
// Copyright (c) 2005, Filia Tao (gudu2005@gmail.com)
// Released under the GPL 2 license
// http://www.gnu.org/copyleft/gpl.html

/*
XPathExpress Example
strats-with(@href,"http")
ends-with(@href,"jpg");
*/
var ImDo = 
{
	onLoad: 
	function() 
	{
		try
		{
			this.prefService = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService).getBranch('imdo.settings.');
		}
		catch(e){};
	},
	createSubFolder:
	function (path,sub_name)
	{
		
		try
		{
		var subFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		subFolder.initWithPath(path);
		}
		catch(e)
		{
			/*alert (e.message);*/
			//alert("The download folder ( " + path + " ) does not exist!");
			return -1;
		};
/*		if (!subFolder.exisit())
		{
			return -1;
		}
*/
		var suffix = "//";
		var sub_folder_path = path+suffix+sub_name;
		try 
		{
			subFolder.initWithPath(sub_folder_path);
		}
		catch(e)
		{
			suffix = "\\";
			sub_folder_path = path+suffix+sub_name;
			subFolder.initWithPath(sub_folder_path);
		}
		var i = 1;
		try 
		{
			while (subFolder.exists())
			{
				sub_folder_path = path+suffix+sub_name+'-'+i;
				subFolder.initWithPath(sub_folder_path);
				i++;
			}
			subFolder.create(subFolder.DIRECTORY_TYPE,0777);	//create the folder
		}
		catch (e)
		{
			//alert(e.message);
			return -1;
		}
		return sub_folder_path;
	},
	saveImage:	
	function(path,src)		
	{
		if (src.length == 0)
			return ;
		//alert("get into saveImage "+src);
		var fileName = src.substring(src.lastIndexOf('/')+1, src.length);
		//Some site don not give the static link of the images.
		//At this situation the link might like httP://some.somesite.com/fetch.dl?********************
		//At this situation I will only make the filename be "badname,jpg"
		//It is ugly to do that ,but currently  I have no idea to deal with it.
		if ( fileName.indexOf('?') != -1 || fileName.indexOf('\\') != -1 
			|| fileName.indexOf('*') != -1 || fileName.indexOf(':') != -1 
			|| fileName.indexOf('"') != -1 || fileName.indexOf('|') != -1 
			|| fileName.indexOf('<') != -1 || fileName.indexOf('>') != -1)
		{
			
			fileName = Math.round(Math.random()*100)+"badname.jpg";
		}
			
		try
		{
		var fileSaving = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		}
		catch(e){/*alert ("error get @mozilla.org/file/local;1");*/};
		var suffix = "//"
		//path += "//";
		try 
		{
			fileSaving.initWithPath(path+suffix);
		}
		catch (e)
		{
			suffix = "\\";
			fileSaving.initWithPath(path+suffix);
		}
		path += suffix;


		if (!fileSaving.exists())
		{
			alert("The download folder does not exist!");
			return;
		}      
	//	alert(path+fileName);
	//	try
	//	{
			fileSaving.initWithPath(path + fileName);
	//	}
	//	catch (e)
	//	{
	//		alert(path + fileName);
	//		return ;
	//	}
		var i = 1;
		var newFileName=fileName;

		while (fileSaving.exists())
		{
			fileSaving.initWithPath(path + i + '-' +fileName);
			i++;
		}
		//alert(path + i + '-' +fileName);
	    var cacheKey  = Components.classes['@mozilla.org/supports-string;1'].createInstance(Components.interfaces.nsISupportsString);
	    cacheKey.data = src;
	      
	    var urifix  = Components.classes['@mozilla.org/docshell/urifixup;1'].getService(Components.interfaces.nsIURIFixup);
	    var uri     = urifix.createFixupURI(src, 0);
		var hosturi = null;
		if (uri.host.length > 0)
		{
			hosturi = urifix.createFixupURI(uri.host, 0);
		}
	    var persist = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
	    persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_FROM_CACHE | Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_CLEANUP_ON_FAILURE;
	    persist.saveURI(uri, cacheKey, hosturi, null, null, fileSaving);
		


	},
	setContextMenu:
	function ()
	{
//		alert("get into setContextMenu");
		try
		{
			this.category = this.prefService.getComplexValue('category-list', Components.interfaces.nsISupportsString).data.split(',');
		}
		catch(e)
		{
	//		alert(e.message);
			return ;
		} 
		var menu_imdo_to = document.getElementById('ImagesDownloadTo');
		while (menu_imdo_to.hasChildNodes())
		{
			menu_imdo_to.removeChild(menu_imdo_to.childNodes[0]);
		}
		for (var i = 0; i < this.category.length; i++)
		{
			if ( this.category[i].length == 0 )
				continue;
			var menu_item = document.createElement('menuitem');
			menu_item.setAttribute('label',this.category[i].split('|')[0]);
			menu_item.setAttribute('oncommand','ImDo.downImageTo('+i+');')
			menu_imdo_to.appendChild(menu_item);
		}

	},
	downImageTo:
	function (index)
	{
		//alert("go into downImageTo");
		try
		{
			this.filter_width = this.prefService.getIntPref('filter-width');
			this.filter_height = this.prefService.getIntPref('filter-height');
			this.filter_type = this.prefService.getCharPref('filter-type');
			this.category = this.prefService.getComplexValue('category-list', Components.interfaces.nsISupportsString).data.split(',');
			//this.category = this.prefService.getCharPref('category-list').split(',');
		}
		catch(e)
		{
	//		alert(e.message);
			return ;
		}
		var doc = document.getElementById("content").selectedBrowser.contentDocument;
		xPathExpr = "//img[";
		xPathExpr += "@width>"+this.filter_width;
		xPathExpr += " and @height>" + this.filter_height;
		//if(this.filter_height
		xPathExpr += +"]";//ends-with(@href, 'http://mail') 
		var images = doc.evaluate(xPathExpr,doc, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		console.log("img num:"+images.snapshotLength);
		//alert(doc.location);
		//alert("images length="+images.length);
		var path = this.category[index].split('|')[1];
		var sub_path = "";
		//alert(this.path);
		if (images.snapshotLength != 0)	//we will at first create sub folder and  then write something to log file .It may be useful  to magner your download images.
		{
			var now = new Date();
			var sub_name = now.getFullYear();
			sub_name += "-"+(now.getMonth()+1);
			sub_name += "-"+now.getDate();
			sub_name += "-"+now.getHours();
			sub_name += "-"+now.getMinutes();
			sub_name += "-"+now.getSeconds();
			sub_path = ImDo.createSubFolder(path,sub_name);
			if (sub_path == -1)
				return ;
			
			var log;
			log  = "ImageDownload Log File \n";
			log += "Date: "+now.toLocaleDateString()+" "+now.toLocaleTimeString()+"\n";
			log += "Reference Page URL   : "+doc.location+"\n";
			log += "Reference Page Title : "+doc.title+"\n"; 
			log += "URL List: \n";
			var savedNum = 0;
			for (var i = 0; i<images.snapshotLength; i++)
			{
				var src = images.snapshotItem(i).src;
				var ext = src.substr(src.lastIndexOf('.')+1,src.length);
				if ( this.filter_type.indexOf(ext) != -1)
					continue;
				ImDo.saveImage(sub_path,src);
				savedNum ++;
				log += images[i].src+"\n";
			}
			try
			{
			var logFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			}
			catch(e){}
			try
			{
				logFile.initWithPath(sub_path+"//"+".imdo.log");
			}
			catch(e)
			{
				logFile.initWithPath(sub_path+"\\"+".imdo.log");
			}
			logFile.create(logFile.NORMAL_FILE_TYPE, 0600);
			var strm = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			
			var convert = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter);
			convert.charset = "UTF-8";
			log = convert.ConvertFromUnicode(log);
			//create log			
			strm.init(logFile,0x04 | 0x08, 0600, 0);
			strm.write(log,log.length);
			strm.flush();
			strm.close();
			
			//show info in status bar	
			//this function is browered from Super DragAndGo
			 function StatusLabel()
			{       			
				var SaveLabel = savedNum+ " images have been saved to "+ sub_path ; 					
				document.getElementById('statusbar-display').label = SaveLabel;
			}
			setTimeout(StatusLabel,100);
		}
		
	}
};

window.addEventListener("load", function(e) { ImDo.onLoad(e); }, false); 
