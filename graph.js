document.addEventListener('DOMContentLoaded', () => {
	listArg();
	
	
	parent=document.getElementById("graph");
	
	showArg('0', parent);
	expandArg('0');
        });

function showArg(id, parent)
{
	//Main div
	const main=document.createElement('div');
	main.id=id;
	main.classList.add("Arg");
	parent.appendChild(main);
	
	if(id!='0')
	{			
		const upline=document.createElement('div');
		upline.classList.add("vertical-line");
		main.appendChild(upline);		
	}
	//trunk div
	const trunk=document.createElement('div');
	trunk.id='T-'+id;
	trunk.classList.add("Trunk");
	trunk.align='center';
	trunk.onclick=function() { expandArg(trunk.id.slice(2)) };
	main.appendChild(trunk);
	
	//Assertion
	const ass=document.createElement('p');
	ass.id='A-'+id;
	ass.classList.add("Assertion");
	ass.textContent=primaryText(id);
	trunk.appendChild(ass);
	
	//Secondary elements container
	const expanded=document.createElement('div');
	expanded.id='EXP-'+id;
	expanded.classList.add("Expanded");
	trunk.appendChild(expanded);
	
	//Reasoning
	const res=document.createElement('p');
	res.id='R-'+id;
	res.classList.add("Reasoning");
	res.textContent=secondaryText(id);
	expanded.appendChild(res);
	
	//Evidence List
	const el=document.createElement('ul');
	el.id='EL-'+id;
	el.classList.add("EvidenceList");
	el.align='center';
	expanded.appendChild(el);
	
	IDs=evList();
	for(let i=0; i<IDs.length; i++)
	{
		if(isEvidenceOf(id, IDs[i]))
		{
			
			const ev=document.createElement('div');
			ev.id=IDs[i];
			ev.classList.add("Evidence");
			ev.textContent=primaryTextEvidence(IDs[i]);
			//ev.onclick=function() { expandEvidence(ev.id) };
			el.appendChild(ev);
			
			const sr=document.createElement('p');
			sr.id='SRC-'+IDs[i];
			sr.classList.add("Source");
			sr.textContent=secondaryTextEvidence(IDs[i]);
			//sr.style.display="none";
			ev.appendChild(sr);
		}
	}
	
	//Button Div
	const but=document.createElement('div');
	but.id='B-'+id;
	but.classList.add("BtnDiv");
	expanded.appendChild(but);
		
	//Add Button Evidence
	const addE=document.createElement('p');
	addE.id='AddE-'+id;
	addE.classList.add("AddBtnEvidence");
	addE.textContent="+";
	addE.onclick=function() { createEvidence(addE.id.slice(5)) };
	but.appendChild(addE);
	
	//More Options Button
	const opt=document.createElement('p');
	opt.id='OPT-'+id;
	opt.classList.add("OptBtn");
	opt.textContent="...";
	opt.onclick=function() { expandOption(opt.id.slice(4)) };
	but.appendChild(opt);
	
	const lowline=document.createElement('div');
	lowline.classList.add("vertical-line");
	main.appendChild(lowline);
	
	
	
	{
		IDs=idList();
		for(let i=0; i<IDs.length; i++)
		{
			if(isParentOf(id, IDs[i]))
			{
				const hline=document.createElement('div');
				hline.classList.add("horizontal-line");
				main.appendChild(hline);
				break;
			}
		}
	}
	
	//SubArgument List
	const sal=document.createElement('ul');
	sal.id='SAL-'+id;
	sal.classList.add("SubArgList");
	main.appendChild(sal);
	
	IDs=idList();
	for(let i=0; i<IDs.length; i++)
	{
		if(isParentOf(id, IDs[i]))
		{
			showArg(IDs[i], sal);
		}
	}
	const addBtnDiv=document.createElement('div');
	sal.appendChild(addBtnDiv);
	
	const butupline=document.createElement('div');
	butupline.classList.add("vertical-line");
	addBtnDiv.appendChild(butupline);
	
	//Add Button Argument
	const addA=document.createElement('p');
	addA.id='AddA-'+id;
	addA.classList.add("AddBtnArg");
	addA.textContent="+";
	addA.onclick=function() { createArg(addA.id.slice(5)) };
	addBtnDiv.appendChild(addA);
}

function expandArg(id)
{
	IDs=idList();
	for(let i=0; i<IDs.length; i++)
	{
		val=""
		if(IDs[i]==id)
			val="block";
		else
			val="none";
		
		document.getElementById('EXP-'+IDs[i]).style.display=val;
	}
}

function createArg(parent)
{
	let lastN=0;
	let found=1;
	IDs=idList();
	while(found==1)
	{
		found=0;
		lastN++;
		for(i=0; i<IDs.length; i++)
		{
			if(lastN+'-'+parent==IDs[i])
				found=1;
		}
	}
	
	id=lastN+'-'+parent;
	
	const p=document.getElementById('AddA-'+parent);
	
	const AI=document.createElement('input');
	AI.id='AI-'+id;
	AI.classList.add("AssertionInput");
	AI.textContent='';
	
	AI.addEventListener('keyup', function onEvent(e) {
		if (event.key === "Enter") {
			appArg(AI.id.slice(3), AI.value, 'Write here the reasoning');
			
			const graph=document.getElementById("graph");
			graph.innerHTML = "";
			showArg('0', graph);
			expandArg(AI.id.slice(3));
		}
	});
	
	p.replaceWith(AI);
}

function createEvidence(parent)
{
	let lastN=0;
	let found=1;
	IDs=evList();
	while(found==1)
	{
		found=0;
		lastN++;
		for(i=0; i<IDs.length; i++)
		{
			if(lastN+'E-'+parent==IDs[i])
				found=1;
		}
	}
	
	id=lastN+'E-'+parent;
	
	const EI=document.createElement('input');
	EI.id='EI-'+id;
	EI.classList.add("AssertionInput");
	EI.textContent='';
	
	EI.addEventListener('keyup', function onEvent(e) {
		if (event.key === "Enter") {
			appEv(EI.id.slice(3), EI.value, 'Write here the sources');
			
			id=EI.id.slice(3);
			id=id.slice(id.search("E-")+2);
			const graph=document.getElementById("graph");
			graph.innerHTML = "";
			showArg('0', graph);
			expandArg(id);
		}
	});
	
	document.getElementById('EL-'+parent).appendChild(EI);
}

function expandOption(id)
{
	modifyMode(id);
}

function idList()
{
	rows=listArg();
            
    if(rows[0].length==0)
    {
		rows=rows.slice(1);
	}
	
    for(let i=0; i<rows.length; i++)
    {	
		let ind=rows[i].search("{");
		rows[i]=rows[i].slice(0, ind).trim();
	}
	return rows;
}
	
function evList()
{
	const argData = document.getElementById('evidence-data').textContent;
    let rows = argData.split('\n');
            
    if(rows[0].length==0)
    {
		rows=rows.slice(1);
	}
	
    for(let i=0; i<rows.length; i++)
    {	
		let ind=rows[i].search("{");
		rows[i]=rows[i].slice(0, ind).trim();
	}
	return rows;
}

function isParentOf(parent, child)
{
	ind=child.search("-");
	return (child.slice(ind+1)==parent && child!=parent);
}

function isEvidenceOf(parent, child)
{
	ind=child.search("E-");
	return (child.slice(ind+2)==parent && child!=parent);
}

function primaryText(id)
{
	rows=listArg();
	
	for(let i=0; i<rows.length; i++)
    {	
		let ind=rows[i].search("{");
		if(rows[i].slice(0, ind).trim()==id)
		{
			let end=rows[i].search("}{");
			return rows[i].slice(ind+1, end);
		}
	}
	return "ERRORE!!";
}

function secondaryText(id)
{
	rows=listArg();
	
	for(let i=0; i<rows.length; i++)
    {	
		let ind=rows[i].search("{");
		if(rows[i].slice(0, ind).trim()==id)
		{
			ind=rows[i].search("}{")+2;
			let end=rows[i].slice(ind).search("}");
			return rows[i].slice(ind, ind+end);
		}
	}
	return "ERRORE!!";
}

function primaryTextEvidence(id)
{
	const argData = document.getElementById('evidence-data').textContent;
            let rows = argData.split('\n');
	
            for(let i=0; i<rows.length; i++)
            {	
		let ind=rows[i].search("{");
		if(rows[i].slice(0, ind).trim()==id)
		{
			let end=rows[i].search("}{");
			return rows[i].slice(ind+1, end);
		}
	}
	return "ERRORE!!";
}

function secondaryTextEvidence(id)
{
	const argData = document.getElementById('evidence-data').textContent;
            let rows = argData.split('\n');
	
            for(let i=0; i<rows.length; i++)
            {	
		let ind=rows[i].search("{");
		if(rows[i].slice(0, ind).trim()==id)
		{
			ind=rows[i].search("}{")+2;
			let end=rows[i].slice(ind).search("}");
			return rows[i].slice(ind, ind+end);
		}
	}
	return "ERRORE!!";
}

function appArg(id, prim, sec)
{
	toAdd='#'+id+'{'+prim+'}{'+sec+'}\n';
	document.getElementById('argument-data').append(toAdd);
}

function appEv(id, prim, sec)
{
	toAdd='#'+id+'{'+prim+'}{'+sec+'}\n';
	document.getElementById('evidence-data').append(toAdd);
}
    
function modifyMode(id)
{
	const ass = document.getElementById('A-' + id);

	const divA = document.createElement('div');
	divA.classList.add("grow-wrap");
	divA.dataset.replicatedValue = ass.textContent;

	const AI = document.createElement('textarea');
	AI.id = 'AI-' + id;
	AI.classList.add("AssertionModify");
	AI.value = ass.textContent;
	AI.spellcheck = false;
	AI.cols = 30;

	AI.oninput = function () {
		this.parentNode.dataset.replicatedValue = this.value;
	};

	divA.appendChild(AI);
	ass.replaceWith(divA);
	
	const res = document.getElementById('R-' + id);

	const divR = document.createElement('div');
	divR.classList.add("grow-wrap");
	divR.dataset.replicatedValue = res.textContent;

	const RI = document.createElement('textarea');
	RI.id = 'RI-' + id;
	RI.classList.add("AssertionModify");
	RI.value = res.textContent;
	RI.spellcheck = false;
	RI.cols = 30;

	RI.oninput = function () {
		this.parentNode.dataset.replicatedValue = this.value;
	};

	divR.appendChild(RI);
	res.replaceWith(divR);
}

function subAss(id, arg)
{
	rows=document.getElementById('argument-data').textContent;
	fID='';
	pos=0;
	while(fID!=id)
	{
		txt=rows.slice(pos+1);
		fID=txt.slice(0, txt.search('{'));
		if(fID!=id)
		{
			pos+=txt.search('\n')+1;
		}
	}
	beforeRows=rows.slice(0, pos);
	afterRows=txt.slice(txt.search('\n')+1);
	final=beforeRows+'\n#'+id+'{'+arg+'}{'+secondaryText(id)+'}\n'+afterRows;
	document.getElementById('argument-data').textContent=final;
}

function subRes(id, arg)
{
	rows=document.getElementById('argument-data').textContent;
	fID='';
	pos=0;
	while(fID!=id)
	{
		txt=rows.slice(pos+1);
		fID=txt.slice(0, txt.search('{'));
		if(fID!=id)
		{
			pos+=txt.search('\n')+1;
		}
	}
	beforeRows=rows.slice(0, pos);
	afterRows=txt.slice(txt.search('\n')+1);
	final=beforeRows+'\n#'+id+'{'+primaryText(id)+'}{'+arg+'}\n'+afterRows;
	document.getElementById('argument-data').textContent=final;
}

function listArg()
{
	rows=document.getElementById('argument-data').textContent;
	rows=rows.split("#");
	
	rows=rows.slice(1);
	
	for(i=0; i<rows.length; i++)
	{
		rows[i]=rows[i].trim();
	}
	
	return rows;
}
