/*******************************************************/
/********************Database script*******************/
/*****************************************************/

/*Database dio skripte sadrzi osnovne funkcije potrebne za odrzavanje indexedDB baze. IndexedDB baza sadrzi 4 object store-a.
Prvi object store 'projects' se odnosi na projekte, sadrzi naziv projekta i ID projekta. Drugi object store 'teams' sadrzi 
podatke o timovima (naziv, ID). Treci object store 'employees' sadrzi podatke o zaposlenim (jmbg,ime,prezime te ID tima kojem pripada). 
U cetvrtom object store 'workHours' cuvaju se podaci o sedmicnoj normi zaposlenih, kljuc u spremanju jeste datum 
(ponedjeljak svake sedmice) te jmbg zaposlenog. Podaci o normi se cuvaju kao niz gdje index 0 niza odgovara Available 
(koliko je zaposlenik dostupan),a svaki sljedeci unos u niz jeste asociran sa projektom, index niza je ID projekta. 
Na taj nacin se dobija jednostavno povezivanje projekata i vremena provedenog na projektima, za svakog radnika. 
Sem izrade indexedDB ovaj dio sadrzi i osnovne funkcije potrebne za pristup podacima u object store-ima.*/ 




const DB_NAME='testDB';		//Konstante potrebne za izradu baze podataka
const DB_VERSION=1;
const DB_STORE_NAME1='projects';
const DB_STORE_NAME2='teams';
const DB_STORE_NAME3='employees';
const DB_STORE_NAME4='workHours';

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June","July", "August", "September",	 				"October","November","December"];
var db;

function openDB(){			//funkcija za otvaranje indexedDB, 
  return new Promise(function(resolve,reject){	//vraca promisu
  var request=indexedDB.open(DB_NAME,DB_VERSION);	//zahtjev za otvaranje baze
  console.log("openDb ...");
 
request.onerror=function(evt){	//reagovanje na gresku prilikom zahtjeva
  console.error("openDb:",evt.target.errorCode);
  reject(Error(request.statusText));
  };

request.onsuccess=function(evt){	//reagovanje na uspjesan zahtjev
  db=this.result;
  if(DB_VERSION!=0){
  resolve(db);
	}
  };

request.onupgradeneeded=function(evt){		//provjera da li je potreban upgrade baze (da li je verzija veca od postojoce)
  db = request.result;
  console.log("opendDb.onupgradeneeded");

  if(!db.objectStoreNames.contains(DB_STORE_NAME1)){	//provjera da li objekat vec postoji u bazi
  var storeProjects=evt.currentTarget.result.createObjectStore(DB_STORE_NAME1,{keyPath:'id'}); //kreiranje objekta
  storeProjects.createIndex('name','name',{unique:true});	//unos indexa
   }

  if(!db.objectStoreNames.contains(DB_STORE_NAME2)){
  var storeTeams=evt.currentTarget.result.createObjectStore(DB_STORE_NAME2,{keyPath:'id'});
  storeTeams.createIndex('name','name',{unique:true});
   }
  
  if(!db.objectStoreNames.contains(DB_STORE_NAME3)){
  var storeEmployees=evt.currentTarget.result.createObjectStore(DB_STORE_NAME3,{keyPath:'jmbg',unique:true});
  storeEmployees.createIndex('firstName','firstName');
  storeEmployees.createIndex('lastName','lastName');
  storeEmployees.createIndex('teamId','teamId');
   }

   if(!db.objectStoreNames.contains(DB_STORE_NAME4)){
   var storeWorkHours=evt.currentTarget.result.createObjectStore(DB_STORE_NAME4,{keyPath:['date','employeeId'],unique:true});
   storeWorkHours.createIndex('employeeId','employeeId');
   storeWorkHours.createIndex('hours','hours');
   }
  resolve(db);
  };
});
}

openDB().then(function(database){		//poziv funkcije za otvaranje baze
	console.log('Database '+database.name+' open.');	
	},function(error){console.error(error);})

function addProject(projectName,projectID,db){	//funkcija za dodavanje podataka o projektima
 var tx=db.transaction(DB_STORE_NAME1,'readwrite');
 var store=tx.objectStore(DB_STORE_NAME1);
 var req=store.add({id:projectID,name:projectName});
 req.onsuccess=function(evt){
  console.log('Insertion successful.');
   };
 req.onerror=function(evt){
   console.log('Error',this.error);
   };
 tx.oncomplete=function(){
   console.log('Transaction complete.');
   }
 }

//openDB().then(function(db){		//dodavanje testnih podataka
//	addProject('Project1',1,db); addProject('Project2',2,db); addProject('Project3',3,db); addProject('Project4',4,db); 
//	addProject('Project5',5,db); addProject('Project6',6,db); addProject('Project7',7,db);},
//	function(error){console.log('Error in openDB');});

function addTeam(teamName,teamID,db){	//funkcija za dodavanje podataka o timovima
 var tx=db.transaction(DB_STORE_NAME2,'readwrite');
 var store=tx.objectStore(DB_STORE_NAME2);
 var req=store.add({id:teamID,name:teamName});
 req.onsuccess=function(evt){
  console.log('Insertion successful.');
   };
 req.onerror=function(evt){
   console.log('Error',this.error);
   };
 tx.oncomplete=function(){
   console.log('Transaction complete.');
   }
 }

//openDB().then(function(db){	//dodavanje testnih podataka
//	addTeam('Absenger',1,db); addTeam('Alicic',2,db); addTeam('Burscher',3,db); addTeam('Faustner',4,db); addTeam('Konrad',5,db);
//	addTeam('Krenn',6,db); addTeam('Lang',7,db);},function(error){console.log('Error in openDB');});

function getProjectById(projectID){	//funkcija za dobijanje projekta po ID-u
	return new Promise(function(resolve,reject){

	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME1,'readonly');
	var store=tx.objectStore(DB_STORE_NAME1);
	var result=store.get(projectID);

	result.onsuccess=function(evt){
	resolve(evt.target.result);
	};

	result.onerror=function(){
	reject('not found');
	};
	},function(error){console.log('Error db');});
   });
}

function getEmployeeById(jmbg){		//funkcija za dobijanje zaposlenika po ID-u
	return new Promise(function(resolve,reject){

	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME3,'readonly');
	var store=tx.objectStore(DB_STORE_NAME3);
	var result=store.get(jmbg);

	result.onsuccess=function(evt){
	resolve(evt.target.result);
	};

	result.onerror=function(){
	reject('not found');
	};
	},function(error){console.log('Error db');});
   });
}

function getTeamById(teamID){		//funkcija za dobijanje tima po ID-u
	return new Promise(function(resolve,reject){

	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME2,'readonly');
	var store=tx.objectStore(DB_STORE_NAME2);
	var result=store.get(teamID);

	result.onsuccess=function(evt){
	resolve(evt.target.result);
	};

	result.onerror=function(){
	reject('not found');
	};
	},function(error){console.log('Error db');});
   });
}

function setTeamsInMenu(){		//funkcija za ucitavanje timova u izbornik
	
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME2,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME2);
	var request=store.openCursor();
	
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	if(cursor){
	var option = document.createElement("option");
    		option.value = cursor.value.name;
    		option.text = cursor.value.name;
    		teamList.appendChild(option);
		cursor.continue();
	}
	};

	request.onerror=function(evt){
	reject(request.statusText);
	};

	},function(error){console.log(error);});
	
}

function setProjectsInTable(table){		//funkcija za ucitavanje projekata u popUpTabelu
	return new Promise(function(resolve){
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME1,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME1);
	var request=store.openCursor();
	
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	if(cursor){
		var row=table.insertRow();
		var cell=row.insertCell();
		cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
		cell.innerHTML=cursor.value.name;
		cursor.continue();
	}
	else{
	console.log('All projects in table');
	resolve();
	}
	};
	},function(error){console.log(error);});
	});
}

function getNumberOfProjects(){		//funkcija za dobijanje ukupnog broja projekata
	return new Promise(function(resolve){
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME1,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME1);
	var request=store.openCursor();
	var number=0;
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	if(cursor){
		number++;
		cursor.continue();
	}
	else{
	console.log('Number of projects: ',number);
	resolve(number);
	}
	};
	},function(error){console.log(error);});
	});
}

function getTeamByName(teamName){	//funkcija za dobijanje tima po imenu

	return new Promise(function(resolve,reject){
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME2,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME2);
	var request=store.openCursor();
	
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	if(cursor){
		if(cursor.value.name===teamName){
		resolve(cursor.value.id);
		}
		else{
		cursor.continue();}
	}
	else{
		console.log('All looked up!');	}
	};

	request.onerror=function(evt){
	reject(request.statusText);
	};

	},function(error){console.log(error);});
    });	
}

function getEmployeesByTeam(team){	//funkcija za dobijanje zaposlenika u jednom timu
	return new Promise(function(resolve,reject){
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME3,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME3);
	var request=store.openCursor();
	var employees=[];
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	console.log('Cursor open!');
	
	if(cursor){
		if(cursor.value.teamId===team){
			employees.push(cursor.value);
			}
		cursor.continue();
		}
	else{
	resolve(employees);
	console.log('All employees looked up!',employees.length);}
	};

	request.onerror=function(evt){
		reject(request.statusText);
	};

	},function(error){console.log(error);});
    });
}



function addEmployee(jmbg,fName,lName,teamId,db){	//funkcija za dodavanje zaposlenika
	var tx=db.transaction(DB_STORE_NAME3,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME3);
	var result=store.add({jmbg:jmbg,firstName:fName,lastName:lName,teamId:teamId});
 	result.onsuccess=function(evt){
  	 console.log('Insertion successful.');
   	};
 	result.onerror=function(evt){
   	 console.log('Error',this.error);
   	};
 	tx.oncomplete=function(){
   	 console.log('Transaction complete.');
   	}
}


//openDB().then(function(result){addEmployee(1,'Adnan','Alicic',1,result);	//dodavanje testnih podataka
//	addEmployee(2,'Emir','Alic',2,result); addEmployee(3,'Aldin','Colic',1,result); addEmployee(4,'Midhat','Begic',1,result);
//	},function(error){console.log(error);});


function addWorkHours(date,employee,hours,db){		//funkcija za dodavanje podataka o radnoj normi zaposlenika
	
	getNumberOfProjects().then(function(number){
	if(hours.length==(number+2)&&date.getDay()==1){	
	var tx=db.transaction(DB_STORE_NAME4,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME4);	
	var result=store.add({date:date,employeeId:employee,hours:hours});
 	result.onsuccess=function(evt){
  	 console.log('Insertion successful.');
   	};
 	result.onerror=function(evt){
   	 console.log('Error',this.error);
   	};
	}
	else{
	console.log('Invalid data!');
	}
	
 	tx.oncomplete=function(){
   	 console.log('Transaction complete.');
   	}});
   }

/*var monday=new Date(2014,10,3);	//dodavanje testnih podataka
openDB().then(function(result){addWorkHours(monday,1,[5,4.5,0,0,0,0,0,0,0],result); addWorkHours(monday,2,[5,4.5,0,0.5,0,0,0,0,0],result);
	addWorkHours(monday,3,[5,4.5,0,0,0,0,0,0,0],result); addWorkHours(monday,4,[5,4,0,0,0,0,0,0,0],result);
	addWorkHours(monday,5,[5,3,0,1,0,0,0,0,0],result); addWorkHours(monday,6,[5,4.5,0,0.5,0,0,0,0,0],result);
	},function(error){console.log(error);});
*/

function getEntries(employee,year,month){	//funkcija za dohvatanje podataka o radnoj normi svakog zaposlenika
	return new Promise(function(resolve,reject){
	openDB().then(function(db){
	var tx=db.transaction(DB_STORE_NAME4,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME4);
	var request=store.openCursor();
	var hours=[];
	request.onsuccess=function(evt){
	var cursor=event.target.result;
	
	if(cursor){
	
	if(cursor.value.date.getFullYear()==year&&cursor.value.employeeId==employee&&cursor.value.date.getMonth()==month){		hours.push(cursor.value);
			}
		cursor.continue();
		}
	else{
	resolve(hours);
	console.log('All dates looked up!',hours.length);}
	};

	request.onerror=function(evt){
		reject(request.statusText);
	};

	},function(error){console.log(error);});
    });
}

function updateWorkHours(key,values,db){	//azuriranje podataka o radnoj normi zaposlenika
	var keyArray=key.split("=",2);
	var dateComponents=keyArray[1].split(" ");
	console.log(key,keyArray[1]);
	var date=new Date(dateComponents[0],dateComponents[1],dateComponents[2]);
	console.log(dateComponents[0],dateComponents[1],dateComponents[2]);
	var tx=db.transaction(DB_STORE_NAME4,'readwrite');
	var store=tx.objectStore(DB_STORE_NAME4);
	var result=store.put({date:date,employeeId:parseInt(keyArray[0]),hours:values});
 	result.onsuccess=function(evt){
  	 console.log('Insertion successful.');
   	};
 	result.onerror=function(evt){
   	 console.log('Error',this.error);
   	};
 	tx.oncomplete=function(){
   	 console.log('Transaction complete.');
   	}
}

	
/***************************************************************************************************/
/***********************************Page javascript*************************************************/
/***************************************************************************************************/


/*Page javascript dio skripte se odnosi na sam rad aplikacije. Sadrzi funckije za prikaz izbornika, zatim prikaz tabele 
za izabrani tim i izabranu godinu, te prikaz popUp tabele za izabranog zaposlenika u izabranom mjesecu. 
Prilikom popunjavanja tabele koriste se funkcije definisane u database dijelu skripte da bi se lakse dobili podaci iz 
indexedDB. Nakon selektovanja tima i godine u izborniku klikom na button Show poziva se funkcija showTable(), 
koja kreira novu tabelu i iz indexedDB uzima podatke vezane za taj tim i tu godinu. 
To se radi pozivajuci funkcije getTeamByName(), getEmployeeByTeam(), getEntries(). 
Nakon dobijanja podataka poziva se funkcija calculateProcentage() koja racuna postotak za svaki mjesec i svakog zaposlenika 
te rezultat dodaje u celije tabele. Za svaku celiju tabele se dodaje ID koji sadrzi jmbg zaposlenika te godinu i mjesec 
za koji je vezan unos. Ovo omogucuje prikaz odgovarajuce popUp tabele na klik celije. 
Dakle, na klik celije poziva se funkcija popUp() koja pomocu podataka iz ID-a celije kreira novu tabelu s podacima
koji se odnose na izabranog zaposlenika, u izabranom mjesecu. Podaci u ovoj tabeli su editable, sto znaci da se mogu 
unositi i mijenjati. Na klik button-a save poziva se funkcija upDate() u kojoj se svi podaci iz popUp tabele spremaju
u niz, te se zatim azuriraju unosi u workHours object store-u, a zatim se radi ponovo proracun 
tabele o godisnjoj ucinkovitosti tima sa novounesenim podacima.*/

document.body.onload=add;	//poziv funkcije add() nakon ucitanja stranice

function add(){		//funkcija koja dodaje osnovne elemente na stranicu(izbornik)
	var Filter=document.createElement("BUTTON");
	Filter.setAttribute('id','Filter');
	Filter.setAttribute('onclick','onClick()');
	Filter.innerHTML="+Filter";

	document.body.appendChild(Filter);

	var DivSelections=document.createElement("div");
	DivSelections.setAttribute('id','DivSelections');
	
	document.body.appendChild(DivSelections);
	document.getElementById("DivSelections").style.display='none';
	
	var teamList=document.createElement("select");
	var yearList=document.createElement("select");
	teamList.setAttribute('id','teamList');
	yearList.setAttribute('id','yearList');

	var Show=document.createElement("button");
	Show.setAttribute('id','Show');
	Show.setAttribute('onclick','showTable()');
	Show.textContent='SHOW';
	
	document.getElementById("DivSelections").appendChild(teamList);
	document.getElementById("DivSelections").appendChild(yearList);
	document.getElementById("DivSelections").appendChild(Show);
	
	setTeamsInMenu();	//dodavanje timova u izbornik

	
	var Years=[2014,2015,2016,2017,2018];	
	

	for (var i = 0; i < Years.length; i++) {	//dodavanje godina u izbornik
    	    var year=new Option(Years[i],Years[i]);
    	    yearList.appendChild(year);
		}
	}		

function onClick(){		//funkcija koja se poziva nakon klika na button filter
	var menu=document.getElementById("DivSelections");
	var button=document.getElementById("Filter");
	button.innerHTML=(button.innerHTML=='+Filter')?'-Filter':'+Filter';
	menu.style.display=(menu.style.display=='block')?'none':'block';
	}


function showTable(){	//funkcija koja se poziva nakon klika na button show, funkcija ispisuje tabelu o radu zaposlenika za datu 					godinu, u datom timu
	
	var header=['Name','Jan','Feb','Mar','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
	var team=teamList.options[teamList.selectedIndex].value;
	var year=yearList.options[yearList.selectedIndex].value;
	if(document.getElementById('table')){document.getElementById('table').remove();}
	
	var table=document.createElement("TABLE");	//kreiranje tabele
	table.setAttribute('id','table');
	table.setAttribute("style","border: 1px solid grey;border-collapse:collapse;");
	
	var caption=table.createCaption();		//naslov tabele
	caption.innerHTML=teamList.options[teamList.selectedIndex].value;
	caption.setAttribute("style","background-color:light grey;border: 1px solid grey;text-align:center");
	
		
	var row=table.insertRow(0);	
	row.setAttribute("style","border: 1px solid grey; background-color:grey;height:30px");
							//kreiranje header-a tabele	
	for(var i=0;i<13;i++){
		var cell=row.insertCell(i);
		cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
		cell.innerHTML=header[i];	
		}


	getTeamByName(team).then(function(id){getEmployeesByTeam(id).then(	//dobijanje podataka o zaposlenim u odabranom timu

	function(Employees){
	var totalSumMonths=[];
	var total=0;
	var results=[];

	for(var i=1;i<=Employees.length+1;i++){table.insertRow(i);}	//popunjavanje tabele dobijenim podacima
	table.rows[Employees.length+1].insertCell(0).innerHTML='Total: ';
	for(var j=0;j<13;j++){				
	for(var i=1;i<=Employees.length+1;i++){
	if(i<=Employees.length){
		var cell=table.rows[i].insertCell(j);
		cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
		cell.setAttribute('onclick','popUp()');
		
		if(j===0){
		cell.innerHTML=Employees[i-1].firstName+' '+Employees[i-1].lastName;
		}
		else{
			calculateProcentage(Employees[i-1].jmbg,year,j-1,cell).then(function(result){	//proracun rada u postocima
			results.push(result);								//za svaki mjesec	
			if(results.length==Employees.length){
			results.forEach(function(result){
				if(result!='-'){
				total+=parseInt(result);
				console.log('total: ',total);
				}});
			if(total!=0){
			totalSumMonths.push(total/Employees.length);
			total=0;}
			else{totalSumMonths.push('-');
				}
			results.length=0;
			var cell=table.rows[Employees.length+1].insertCell();
			cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
			cell.innerHTML=(totalSumMonths[totalSumMonths.length-1]!='-')?
					totalSumMonths[totalSumMonths.length-1].toFixed(2)+'%':'-';
			}});}}
		
	}
	 }},function(error){console.log(error);})
	});
	
	document.body.appendChild(table);	//prikaz tabele
	}


function calculateProcentage(employee,year,month,cell){		//funkcija koja racuna postotak za svakog radnika
	return new Promise(function(resolve,reject){
	getEntries(employee,year,month).then(function(info){
	var procentage=[];
	var procent=0;
	for(var i=0;i<info.length;i++){
		for(var j=1;j<info[i].hours.length;j++){
		if(info[i].hours[j]!='-'){
		procent+=info[i].hours[j];}
		}
		if(info[i].hours[0]!='-'){
		procent=(procent/info[i].hours[0])*100;
		procentage.push(procent);}
		procent=0;
		}
	var sum=0;
	for(var i=0;i<procentage.length;i++){
	sum+=procentage[i];
	}
	if(sum==0||procentage.length==0){
		 cell.innerHTML='-';
		}
	else{
		cell.innerHTML=sum/procentage.length+'%';
	}
	cell.setAttribute("id",employee+' '+year+' '+month);
	resolve(cell.innerHTML);
	});
	});	
 }

function popUp(){	//funkcija koja otvara pop-up tabelu o radu zaposlenog za dati mjesec

	var popUpDiv=document.createElement('DIV');
	popUpDiv.setAttribute('id','popUpDiv');

	if(document.getElementById('popUpTable')){document.getElementById('popUpTable').remove();}

	var popUpTable=document.createElement('TABLE');		//kreiranje tabele
	popUpTable.setAttribute('id','popUpTable');
	table.setAttribute("style","border: 1px solid grey;border-collapse:collapse;");
    	
	var saveButton=document.createElement('BUTTON');	//button za save unesenih podataka
	saveButton.innerHTML='Save';
	saveButton.setAttribute('onclick','upDate()');
	
	var title=document.createElement('H4');
	
	var values=event.target.id.split(" ",3);	//dobijanje podataka o ID-u celije za koju je pozvan popUp
	
	getEmployeeById(parseInt(values[0])).then(function(result){	//dobijanje podataka o imenu i prezimenu zaposlenog
			title.innerHTML=MONTH_NAMES[values[2]]+' '+values[1]+' ('+result.firstName+' '+result.lastName+')';});

	popUpDiv.appendChild(title);
	popUpDiv.appendChild(popUpTable);
	popUpDiv.appendChild(saveButton);


	getEntries(parseInt(values[0]),parseInt(values[1]),parseInt(values[2])).then(function(info){	//dobijanje podataka o 
	var row=popUpTable.insertRow();									//satnici zaposlenog
	var cell=row.insertCell();
	cell.innerHTML='Project(s):';
	cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
	cell=popUpTable.insertRow().insertCell();
	cell.innerHTML='Available: ';
	cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
	setProjectsInTable(popUpTable).then(function(){
	cell=popUpTable.insertRow().insertCell();
	cell.innerHTML='Urlaub: ';
	cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
	
	var datesOfMondays=[];	//dobijanje svih ponedjeljaka u odabranom mjesecu odabrane godine
	for(var i=1;i<=31;i++){
	var date=new Date(parseInt(values[1]),parseInt(values[2]),i);
	if(date.getDay()==1&&date.getMonth()==parseInt(values[2])){
		datesOfMondays.push(date);
		}
	}
	
	for(var i=0;i<datesOfMondays.length;i++){	//popunjavanje popUp tabele podacima
	var flag=0;
		for(var k=0;k<info.length;k++){
			if(datesOfMondays[i].getTime()===info[k].date.getTime()){
				for(var j=0;j<popUpTable.rows.length;j++){
				var cell=popUpTable.rows[j].insertCell();
				cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
			if(j==0){
				cell.innerHTML='  '+(info[k].date.getDate())+'.'+(info[k].date.getMonth()+1)+'  ';
				cell.setAttribute('id',values[0]+'='+info[k].date.getFullYear()+' '+info[k].date.getMonth()
				+' '+info[k].date.getDate());
				}
			else{
				cell.setAttribute('contenteditable','true');
				cell.innerHTML=info[k].hours[j-1];
				}
			}
			flag++;
			}
			}
			if(flag){continue;}
			else{
				for(var j=0;j<popUpTable.rows.length;j++){
				var cell=popUpTable.rows[j].insertCell();
				cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");
			if(j==0){
				cell.innerHTML='  '+(datesOfMondays[i].getDate())+'.'+(datesOfMondays[i].getMonth()+1)+'  ';
				cell.setAttribute('id',values[0]+'='+datesOfMondays[i].getFullYear()+' '
				+datesOfMondays[i].getMonth()+' '+datesOfMondays[i].getDate());
				}
			else{
				cell.setAttribute('contenteditable','true');
				cell.innerHTML='-';
				}
				}
			}
				
				
		}

	var cell=popUpTable.insertRow().insertCell();
	cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:right");
	cell.innerHTML='Utilization: ';
	
	for(var i=1;i<popUpTable.rows[1].cells.length;i++){	//racunanje postotaka za svaki ponedjeljak
		var flag=0;
		var cell=popUpTable.rows[popUpTable.rows.length-1].insertCell();
		cell.setAttribute("style","border: 1px solid grey;width:auto;text-align:center");	
		var total=0;
		for(var j=1;j<popUpTable.rows.length-1;j++){
			if(popUpTable.rows[j].cells[i].innerHTML=='-'){
				cell.innerHTML='-';
				flag++;
				}
			else if(j>1){
				if(popUpTable.rows[j].cells[i].innerHTML!='-'){
				total+=parseFloat(popUpTable.rows[j].cells[i].innerHTML);}
				}
			}
	if(!flag){
	cell.innerHTML=(total/parseFloat(popUpTable.rows[1].cells[i].innerHTML))*100+'%';}
		
		}
		
	});
	});
	
	
	BootstrapDialog.show({message:popUpDiv});	//pop up elemenata za unos podataka o radniku
	}

function upDate(){	//funkcija koja se poziva nakon editovanja
	for(var i=1;i<popUpTable.rows[0].cells.length;i++){	//skupljanje novih podataka unsenih u tabelu
		var newValues=[];
		for(var j=1;j<popUpTable.rows.length-1;j++){
		if(popUpTable.rows[j].cells[i].innerHTML!='-'){
			newValues.push(parseFloat(popUpTable.rows[j].cells[i].innerHTML));}
			else{newValues.push('-');}
			}
		
	var temp=popUpTable.rows[0].cells[i].id;
	updateWorkHours(temp,newValues,db);	//unos novounesenih podataka u store workHours
		}
	showTable();	//ispis tabele sa novounesenim podacima
	}
