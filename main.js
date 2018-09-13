function setStatus(text) {
	console.log(text);
	document.getElementById("status").innerHTML = text;
}

function PullData(file, name, outelement, key) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {

		if(xhr.readyState == 4){
			setStatus("Downloaded !");
			var outdata = JSON.parse(xhr.responseText);
			if (outdata.success === false)
				return alert(outdata.error);
			var resultParts = [];
			//console.log(outdata);
			try {
				var len = 0;
				var i;
				setStatus("Decrypting ...");
				for (i = 0; i < outdata.parts.length; i++) {
					var decrypted = Crypto.charenc.Binary.stringToBytes(Crypto.AES.decrypt(outdata.parts[i], key));
					len += decrypted.length;
					resultParts.push(decrypted);
				}
				setStatus("Merging file parts ...");
				var result = new Uint8Array(len);
				var j = 0;
				for (i = 0; i < resultParts.length; i++) {
					result.set(resultParts[i], j);
					j += resultParts[i].length;
				}

				outelement.className = "downloaded";
				setStatus("Done !");
				download(result, name);
			}
			catch(err) {
				setStatus("Could not decrypt file");
				console.dir(err);
				alert("wrong key!");
			}
		}
	};
	
	xhr.open("GET", "download.php?file=" + file, true);
	xhr.send();
	return false;
}

window.addEventListener("load", function() {

	document.getElementById("send").addEventListener("click", function(e){
		uploadAtt(e);
	});	
	
	listFiles();

	document.getElementById("uploadForm").addEventListener("submit", function(e) {
		e.preventDefault();
	});
});

function uploadFiles(parts, name, callback) {
	setStatus("uploading files");
	var oReq = new XMLHttpRequest();
	oReq.open("POST", "upload.php", true);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.addEventListener("load", callback);
	oReq.send(JSON.stringify({
		name: name,
		parts: parts
	}));
}

function splitFile(blob, size) {
	setStatus("Splitting files");
	var parts = [];
	var buf = new Uint8Array(blob);
	for (var i = 0;  i < buf.length; i += size) {
		parts.push(buf.subarray(i, i + size));
	}
	setStatus("Files splitted into " + parts.length + " parts");
	encryptFiles(parts);
}

function encryptFiles(parts) {
	setStatus("Encrypting parts");
	var key = document.getElementById("password").value;
	for (var i = 0; i < parts.length; i++) {
		parts[i] = Crypto.AES.encrypt(Crypto.charenc.Binary.bytesToString(parts[i]), key);
	}
	setStatus("Parts encrypted");
	var file = document.getElementById("file").files[0];
	uploadFiles(parts, file.name, function() {
		listFiles();
	});
}

function uploadAtt() {
	var size = parseInt(document.getElementById("partSize").value);
	if (isNaN(size) || size < 10240 || size > 2048000) {
		alert("Invalid size : falling back to default size (500kB)");
	}
	var reader = new FileReader();
	var file = document.getElementById("file").files[0];
	reader.onload = function(e) {
		splitFile(e.target.result, size);
	};
	reader.readAsArrayBuffer(file);
}

function listFiles() {
	setStatus("Listing files");
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4){
			var files = JSON.parse(xhr.responseText);
			setStatus("Found " + files.length + " files");
			var filelist = document.getElementById("fileList");
			filelist.innerHTML = "";
			
			for(var i in files) {
				var li = document.createElement("li");
				var a = document.createElement("a");
				a.href = "javascript:void(0)";
				a.className = "fileel";
				a.dataset.path = files[i].path;
				a.dataset.name = files[i].name;
				a.innerHTML = files[i].name;
				a.addEventListener("click", function(e) {
					setStatus("Downloading...");
					PullData(e.target.dataset.path, e.target.dataset.name, e.target, document.getElementById("decryptkey").value);
				});
				li.appendChild(a);

				// Debug : A link to download the Zipped file of encrypted parts
				var debug = document.createElement("a");
				debug.href = "data/" + files[i].path;
				debug.innerHTML = " (Download Zip)";
				li.appendChild(debug);

				filelist.appendChild(li);
			}
		}
	};

	xhr.open("GET", "list.php", true);
	xhr.send();
}
