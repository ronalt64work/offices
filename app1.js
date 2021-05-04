const http_lib 			= require('http');
const url_lib			= require('url');
const fs_lib			= require('fs');
const readline_lib 		= require('readline');

const hostname 			= "127.0.0.1";

const port 				= "3001";

//declare a function to read the file.
async function lets_read_file(filename){
	console.log(`roger that! beginning to read the file ${filename}`);
	const file_strm 	= fs_lib.createReadStream(filename);

	const line_rdr		= readline_lib.createInterface(
	{
		input: file_strm,
		crlfDelay: Infinity
	}
	);
	var all_lines		= new Array();
	var iterat			=0;
	for await (const this_line of line_rdr){
		var line_str 	= this_line;
		line_str 		= line_str.replace('[','');
		line_str		= line_str.replace(']','');
		all_lines[iterat]	=	line_str;
		iterat			=	iterat + 1;
		console.log(`Line from file ${this_line}	>> ${line_str}`);
	}
	console.log('this should be written after read is done!');
	console.log(`total length of this array ${all_lines.length}`)
}


//declare the function to read 1 and 0s
function find_1_0(){

}

//sort the collected 1 and 0s.
function sort_1_0(){

}

//go through the collected coordinates (Row, Col) and find relatives.
//we use pointers to see how to move.
//pointer pattern stands for: 
//R> row.
//m> minus
//1> movements.
//C> column.
function seek_offices(){

}

function seek_relatives(){
	
}

//declaration only of the server itself
const my_server = http_lib.createServer(function(req,res){
	//parsing the request.
	const url_object = url_lib.parse(req.url,true).query;
	
	res.statusCode = 200; //ok.
	res.setHeader('Content-type','text-plain');
	res.end('hell at world!');

	//after sending the response, show the content of the request in console.
	if(url_object.readf =="yes"){
		console.log('received, will read the file');
		lets_read_file('my_file.txt');
	}else
	{
		console.log(`not heard from you -${url_object.readf}-`);
	}
});

//start the server.
my_server.listen(port,hostname,()=>{
	console.log(`this server has started at: http://${hostname}:${port}/`);
});



