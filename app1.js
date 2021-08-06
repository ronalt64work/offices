//this comment is just to initialize the development branch. nothing else.

const fs_lib			= require('fs');

var building			=[];
var b_coord				=[];
var offices 			=[];
var finalmap			=[];

//control of approach in 'eating' terms.
const Rm1C		=true;
const RCm1		=true;
const RCp1		=false;
const Rp1C		=false;
const Rp1Cp1	=false;

//declare a function to read the file.
function lets_read_file(filename, print=false){
	
	var rows = fs_lib.readFileSync(filename,'utf-8').split('\n');
	if(print){
		console.log(`gathered content (${rows.length})`);
		console.log(rows);
	}

	//processing the lines to create a matrix.
	rows.forEach((line)=>{
		line = String(line);
		line = line.replace('\r',''); //somehow the \r char is still coming...
		line = line.replace('[','');
		line = line.replace(']','');
		building.push(line);
	});

	//console.table(building);

	//let's find the 1 and 0s.
	find_1_0();

	//check
	//print_1_0();

	find_offices();

	if(print) print_offices();

	if(print)remap_final();
	return offices.length;
}


//declare the function to read 1 and 0s
function find_1_0(){
	var _row	=	0;
	building.forEach((segment, segment_i)=>{
		segment		= String(segment);
		segment		= segment.split(',');
		var _col 	= 0;
		let current_row = [];
		segment.forEach((qbicle, qbicle_i)=>{
			//save the coordenates for this position in the file only if 1 is found.
			if(qbicle >= 1){
				let this_coord	=	String(_row) + ','+String(_col);
				if (b_coord.indexOf(this_coord)<0){
					b_coord.push(this_coord);
				}
				current_row[qbicle_i] = "111";
			}else current_row[qbicle_i] = "000";
			
			_col 	= _col +1;
		});
		finalmap[segment_i] = current_row;
		_row 	= _row +1;
	})
	building = []; //clear contents.
}

function print_1_0(){
	b_coord.forEach((coordinate)=>{
		console.log(coordinate);
	})
}

function remap_final(){

	draw_map('initial map');

	offices.forEach((office,office_i)=>{
		office.forEach((qbicle,qbicle_i)=>{
			let this_pair = String(qbicle).split(',');
			finalmap[this_pair[0]][this_pair[1]] = office_i+101;
		});
	});

	draw_map('final map after office-check');
}

function draw_map(this_phase){
	console.log(this_phase);
	finalmap.forEach((this_row,row_i)=>{
		console.log('['+this_row +']');
	});
}

//go through the collected coordinates (Row, Col) and find relatives.
//we use pointers to see how to move.
//pointer pattern stands for: 
//R> row.
//m> minus
//1> movements.
//C> column.
function find_offices(){
	var saver	=	0;
	var var_length_array	=	b_coord.length;
	while(0<var_length_array && saver <10000){
		let this_coord	=	String(b_coord[0]).split(',');
		let this_row	=	this_coord[0];
		let this_col	=	this_coord[1];

		//main function
		find_relatives(this_row,this_col);

		var_length_array	=	b_coord.length;
		saver 	=	saver + 1;
	}
}

function find_relatives(s_row, s_col){
	//here we use a pac-man approach.
	//convert the current coordinate as an office and start 'eating' any colliding qbicle.
	//check the flags for R[p,m][1],C[p.m][1] as it controls what to eat ahead...
	//because we want to later on build a map of an office and all its qbicles, we create 
	//a new array with all those coordinates.
	var curr_qbicles 	=	[];
	//case 1: first time, no offices added, we insert this current one (it's a 1 after all...)
	if(offices.length <=0){
		//add this current coordinate and try to eat ahead.
		let search_q = String(s_row)+','+String(s_col);
		curr_qbicles.push(search_q);
		b_coord.splice(0,1);

		//try to eat ahead: (R, C+1)
		let search_r	=	s_row;
		let search_c	=	s_col + 1;
		search_q		=	String(search_r)+','+String(search_c);
		if(RCp1){
			let search_found	=b_coord.indexOf(search_q);	
			if(search_found>=0){
				curr_qbicles.push(search_q);
				b_coord.splice(search_found,1);
			}
		}

		//try to eat ahead: (R+1,C)
		search_r	=	s_row+1;
		search_c	=	s_col;
		search_q	=	String(search_r)+','+String(search_c);
		if(Rp1C){
			let search_found 	= b_coord.indexOf(search_q);
			if(search_found>=0){
				curr_qbicles.push(search_q);
				b_coord.splice(search_found,1);
				//because we are already in one row ahead, we can try to eat one more.
				//try to eat ahead: (R+1, C+1)
				search_r	=	s_row+1;
				search_c	=	s_col+1;
				search_q	= String(search_r)+','+String(search_c);
				if(Rp1Cp1){
					search_found	= b_coord.indexOf(search_q);
					if(search_found>=0){
						curr_qbicles.push(search_q);
						b_coord.splice(search_found,1);
					}
				}
			}
		}
		offices.push(curr_qbicles);
	}
	else{//not the first time. it means we somehow follow the structure for first time
		//but now we have to see if there already any missing father, and attach to it.
		//try to eat> (R-1, C)
		let search_c	= 0;
		let search_r	= 0;
		let found_i		= -1;
		let found_i_rel	= -1;
		let search_q	= '';
		//make sure.
		curr_qbicles 	=	[];
		if(Rm1C){
			search_c	=	s_col;
			search_r	=	s_row-1;
			search_q	= String(search_r)+','+String(search_c);
			let breakit = false;
			offices.forEach((office,father_i)=>{
				if(office.indexOf(search_q)>=0 && !breakit){
					found_i 	= father_i;//found the father, must attach this child.
					search_q	= String(s_row)+','+String(s_col);
					office.push(search_q);//current office captures the current child.
					b_coord.splice(b_coord.indexOf(search_q),1); //consume this child.
					offices.splice(found_i,1,office);
					breakit	=	true;
				}
			});
		}
		//try to eat at position (R, C-1)
		if(RCm1){
			search_c	= s_col-1;
			search_r	= s_row;
			search_q	= String(search_r)+','+String(search_c);
			let breakit	= false;
			offices.forEach((office,father_i)=>{
				if(office.indexOf(search_q)>=0 && !breakit){
					found_i_rel = father_i;
					if(found_i <0){//no owner has yet been found, keep this owner.
						found_i 	= father_i;
						found_i_rel = -1;
						search_q	= String(s_row)+','+String(s_col);
						office.push(search_q);
						b_coord.splice(b_coord.indexOf(search_q),1);
						offices.splice(found_i,1,office);
					}else{//we have found one owner for this current, BUT there is also another
						//must merge these two owners.
						found_i 	= remap_parent(found_i,found_i_rel);
					}
					breakit = true;
				}
			});
		}

		if(RCp1){
			search_c	= s_col+1;
			search_r	= s_row;
			search_q	= String(search_r)+','+String(search_c);
			breakit		= false;
			offices.forEach((office,father_i)=>{
				if(office.indexOf(search_q)>=0 && !breakit){
					found_i_rel	= father_i;
					if(found_i<0){
						found_i 	= father_i;
						found_i_rel = -1;
						search_q	= String(s_row)+','+String(s_col);
						office.push(search_q);
						b_coord.splice(b_coord.indexOf(search_q),1);
						offices.splice(found_i,1,office);
					}else{
						found_i 	= remap_parent(found_i,found_i_rel);
					}
					breakit	=	true;
				}
			});
		}

		if(found_i <0){//no owner found yet, meaning NEW office.
			//check if can eat (R, C+1) and based on it, try
			// (R+1, C) >> (R+1,C+1)
			search_c	= s_col;
			search_r	= s_row;
			search_q 	= String(search_r)+','+String(search_c);
			curr_qbicles 	=	[];

			curr_qbicles.push(search_q);
			b_coord.splice(b_coord.indexOf(search_q),1);

			if(RCp1){
				search_c	= s_col +1;
				search_r	= s_row;
				search_q 	= String(search_r)+','+String(search_c);
				let search_found	= b_coord.indexOf(search_q);
				if(search_found>=0){
					curr_qbicles.push(search_q);
					b_coord.splice(search_found,1);
				}
			}

			if(Rp1C){
				search_c = s_col;
				search_r = s_row +1;
				search_q 	= String(search_r)+','+String(search_c);
				let search_found	= b_coord.indexOf(search_q);
				if(search_found>=0){
					curr_qbicles.push(search_q);
					b_coord.splice(search_found,1);

					if(Rp1Cp1){
						search_c = s_col +1;
						search_r = s_row +1;
						search_q = String(search_r)+','+String(search_c);
						search_found = b_coord.indexOf(search_q);
						if(search_found>=0){
							curr_qbicles.push(search_q);
							b_coord.splice(search_found,1);
						}
					}
				}
			}
			offices.push(curr_qbicles);
		}else{//owner is found, check to eat for this owner.
			//(R,C+1) >> (R+1,C)
			curr_qbicles = []; //make sure, clean it.
			curr_qbicles = offices[found_i];
			if(RCp1){
				search_c = s_col +1;
				search_r = s_row;
				search_q = String(search_r)+','+String(search_c);
				let search_found = b_coord.indexOf(search_q);
				if(search_found>=0){
					curr_qbicles.push(search_q);
					b_coord.splice(search_found,1);
				}
			}

			if(Rp1C){
				search_c = s_col;
				search_r = s_row+1;
				search_q = String(search_r)+','+String(search_c);
				let search_found = b_coord.indexOf(search_q);
				if(search_found>=0){
					curr_qbicles.push(search_q);
					b_coord.splice(search_found,1);
					//because this was found, we can link to 1 step ahead.(R+1,C+1)
					if(Rp1Cp1){
						search_c = s_col +1;
						search_r = s_row +1;
						search_q = String(search_r)+','+String(search_c);
						search_found = b_coord.indexOf(search_q);
						if(search_found>=0){
							curr_qbicles.push(search_q);
							b_coord.splice(search_found,1);
						}
					}
					offices.splice(found_i,1,curr_qbicles);
				}
			}
		}
	}
}

function remap_parent(index_pa, index_pb){
	let newindex = -1;
	if (index_pa == index_pb){//do nothing they share the same parent, not sure why we've got here.
		newindex	= index_pa;
	}
	else{
		let parent_a = offices[index_pa];
		let parent_b = offices[index_pb];
		if(parent_a == null || parent_b == null){
			console.log(`either parent a or b is null a> ${parent_a}  b> ${parent_b}`);
		}else{
			parent_b.forEach((qbicle)=>{
				parent_a.push(qbicle);
			});

			offices.splice(index_pa,1,parent_a);

			offices.splice(index_pb,1);
			if(index_pa > index_pb){
				newindex	= index_pa -1;
			}else{
				newindex 	= index_pa;
			}
		}
	}
}

function print_offices(){
	console.log(`total offices: ${offices.length}`);
	offices.forEach((office,office_i)=>{
		let this_line = '';
		office.forEach((qbicle)=>{
			this_line = this_line + '('+qbicle + ')';
		});
		console.log(`indx: ${office_i} >> ${this_line}`);
	});
}

//lets_read_file('samples/file1.txt',true);

module.exports=lets_read_file;