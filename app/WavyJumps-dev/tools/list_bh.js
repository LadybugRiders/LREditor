var fs = require('fs');

var prefix = "<script src=\"";
var suffix = "\"></script>";

var files = new Array();
listJsFilesRecursively( files, __dirname.replace("\\tools","")+"/assets/behaviours" );
var str = files.join('\r');
fs.writeFileSync(__dirname+"/bhs.txt", str);

// get all js files recursively
function listJsFilesRecursively(_files, path) {
	var stats = fs.statSync(path);
	if (stats.isFile() == true && path.indexOf(".js") >= 0) {
		var cutPath = path;
		var i = path.indexOf("assets/behaviours");
		cutPath = path.substring(i);
		_files.push(prefix + cutPath + suffix);
	} else if (stats.isDirectory() == true) {
		var files = fs.readdirSync(path);
		files.forEach(function(_file) {
			listJsFilesRecursively(_files, path + "/" + _file);
		});
	}
}

function replaceAll(string, search, replace)
{
    //if replace is null, return original string otherwise it will
    //replace search string with 'undefined'.
    if(!replace) 
        return string;

    return string.replace(new RegExp('[' + search + ']', 'g'), replace);
};
