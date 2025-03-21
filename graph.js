document.addEventListener('DOMContentLoaded', () => {
    fetchRecords();
});

// Supabase configuration
const SUPABASE_URL = 'https://htbxgsolhsxacotnprjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Ynhnc29saHN4YWNvdG5wcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzQ2MzAsImV4cCI6MjA1NzIxMDYzMH0.OJy9IdF8aWh_YuqU3WIdvuqAX-2GAfTTjMxu9zMAHMo';

// Initialize the Supabase client using the global object
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

var evidenceList = [];
class Evidence {
  constructor(id, explanation, source, parent) {
	this.id = id;
    this.explanation = explanation; 
    this.source = source;
    this.parent = parent;
  }
}

var argumentList = [];
class Argument {
  constructor(id, assertion, reasoning, parent) {
	this.id = id;
    this.assertion = assertion; 
    this.reasoning = reasoning;
    this.parent = parent;
  }
}


async function fetchRecords() {
	
	{
		const {
			data,
			error
		} = await supabaseClient.from('Argument').select('*');
		if (error) {
			console.error('Error fetching records:', error);
			return;
		}
		
		argumentList=[];
		data.forEach(argument => {
			const newArgument = new Argument(argument.id, argument.Assertion, argument.Reasoning, argument.Parent);
			argumentList.push(newArgument);
		});
	}
	{	
		const {
			data,
			error
		} = await supabaseClient.from('Evidence').select('*');
		if (error) {
			console.error('Error fetching records:', error);
			return;
		}
		evidenceList=[];
		data.forEach(evidence => {
			const newEvidence = new Evidence(evidence.id, evidence.Explanation, evidence.Source, evidence.Parent);
			evidenceList.push(newEvidence);
			});		
	}
	
    parent = document.getElementById("graph");
    parent.innerHTML='';
    showArg(childOf('0'), parent);
    expandArg(childOf('0'));
}

function showArg(id, parent) {

    //Main div
    const main = document.createElement('div');
    main.id = id;
    main.classList.add("Arg");
    parent.appendChild(main);

    if (id != childOf('0')) {
        const upline = document.createElement('div');
        upline.classList.add("vertical-line");
        main.appendChild(upline);
    }

    //trunk div
    const trunk = document.createElement('div');
    trunk.id = 'T-' + id;
    trunk.classList.add("Trunk");
    trunk.align = 'center';
    trunk.onclick = function() {
        expandArg(trunk.id.slice(2))
    };
    main.appendChild(trunk);

    //Assertion
    const ass = document.createElement('p');
    ass.id = 'A-' + id;
    ass.classList.add("Assertion");
    ass.textContent = findArg(id).assertion;
    trunk.appendChild(ass);

    //Secondary elements container
    const expanded = document.createElement('div');
    expanded.id = 'EXP-' + id;
    expanded.classList.add("Expanded");
    trunk.appendChild(expanded);

    //Reasoning
    const res = document.createElement('p');
    res.id = 'R-' + id;
    res.classList.add("Reasoning");
    res.textContent = findArg(id).reasoning;
    expanded.appendChild(res);

    //Evidence List
    const el = document.createElement('ul');
    el.id = 'EL-' + id;
    el.classList.add("EvidenceList");
    el.align = 'center';
    expanded.appendChild(el);

    IDs = evIdList();
    for (let i = 0; i < evidenceList.length; i++) {
        if (id==evidenceList[i].parent) {
			showEv(evidenceList[i], el);
        }
    }

    //Button Div
    const but = document.createElement('div');
    but.id = 'B-' + id;
    but.classList.add("BtnDiv");
    expanded.appendChild(but);

    //Add Button Evidence
    const addE = document.createElement('p');
    addE.id = 'AddE-' + id;
    addE.classList.add("AddBtnEvidence");
    addE.textContent = "+";
    addE.onclick = function() {
        createEv(addE.id.slice(5))
    };
    but.appendChild(addE);

    //More Options Button
    const opt = document.createElement('p');
    opt.id = 'OPT-' + id;
    opt.classList.add("OptBtn");
    opt.textContent = "...";
    opt.onclick = function() {
        expandOption(opt.id.slice(4))
    };
    but.appendChild(opt);
	
	//Connecting lines
    const lowline = document.createElement('div');
    lowline.classList.add("vertical-line");
    main.appendChild(lowline);
	
    {
        for (let i = 0; i < argumentList.length; i++) {
            if (argumentList[i].parent == id) {
                const hline = document.createElement('div');
                hline.classList.add("horizontal-line");
                main.appendChild(hline);
                break;
            }
        }
    }

    //SubArgument List
    const sal = document.createElement('ul');
    sal.id = 'SAL-' + id;
    sal.classList.add("SubArgList");
    main.appendChild(sal);

    for (let i = 0; i < argumentList.length; i++) {
        if (argumentList[i].parent == id) {
            showArg(argumentList[i].id, sal);
        }
    }
    const addBtnDiv = document.createElement('div');
    sal.appendChild(addBtnDiv);

    const butupline = document.createElement('div');
    butupline.classList.add("vertical-line");
    addBtnDiv.appendChild(butupline);

    //Add Button Argument
    const addA = document.createElement('p');
    addA.id = 'AddA-' + id;
    addA.classList.add("AddBtnArg");
    addA.textContent = "+";
    addA.onclick = function() {
        createArg(addA.id.slice(5))
    };
    addBtnDiv.appendChild(addA);
}

function expandArg(id) {
    for (let i = 0; i < argumentList.length; i++) {
        val = ""
        if (argumentList[i].id == id)
            val = "block";
        else
            val = "none";

        document.getElementById('EXP-' + argumentList[i].id).style.display = val;
    }
}

function expandOption(id) {
    modify(id);
}

function showEv(evidence, el){
	const ev = document.createElement('div');
    ev.id = 'EV-'+evidence.id;
    ev.classList.add("Evidence");
    ev.textContent = evidence.explanation;
    el.appendChild(ev);

    const sr = document.createElement('p');
    sr.id = 'SRC-' + evidence.id;
    sr.classList.add("Source");
    sr.textContent = evidence.source;
    ev.appendChild(sr);
}

function modify(id) {
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

    AI.oninput = function() {
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

    RI.oninput = function() {
        this.parentNode.dataset.replicatedValue = this.value;
    };

    divR.appendChild(RI);
    res.replaceWith(divR);
    
    for(i=0; i<evidenceList.length; i++){
    if(evidenceList[i].parent==id){
		const divE = document.getElementById('EV-' + evidenceList[i].id);
		
		const modEvDiv = document.createElement('div');
		modEvDiv.classList.add("grow-wrap");
		modEvDiv.dataset.replicatedValue = ass.textContent;

		const EI = document.createElement('textarea');
		EI.id = 'EI-' + evidenceList[i].id;
		EI.classList.add("ExplanationModify");
		EI.value = evidenceList[i].explanation;
		EI.spellcheck = false;
		EI.cols = 24;

		EI.oninput = function() {
			this.parentNode.dataset.replicatedValue = this.value;
		};

		modEvDiv.appendChild(EI);

		const divS = document.createElement('div');
		divS.classList.add("grow-wrap");
		divS.dataset.replicatedValue = res.textContent;

		const SI = document.createElement('textarea');
		SI.id = 'SI-' + evidenceList[i].id;
		SI.classList.add("SourceModify");
		SI.value = evidenceList[i].source;
		SI.spellcheck = false;
		SI.cols = 24;

		SI.oninput = function() {
			this.parentNode.dataset.replicatedValue = this.value;
		};

		divS.appendChild(SI);
		
		const delEvBtn=document.createElement('p');
		delEvBtn.id = 'delEvBtn-' + evidenceList[i].id;
		delEvBtn.classList.add("delEvBtn");
		delEvBtn.textContent = "X";
		delEvBtn.onclick = function() {
		deleteEv(delEvBtn.id.slice(9));
    };
		
		modEvDiv.appendChild(divS);
		
		modEvDiv.appendChild(delEvBtn);
		
		divE.replaceWith(modEvDiv);
	}}
	
    const optBtn = document.getElementById('OPT-' + id);
    const saveBtn = document.createElement('p');
    saveBtn.id = 'saveBtn-' + id;
    saveBtn.classList.add("saveBtn");
    saveBtn.textContent = "save";
    saveBtn.onclick = function() {
        updateArg(id, AI.value, RI.value);
        for(i=0; i<evidenceList.length; i++){
			if(evidenceList[i].parent==id){	
				const EI=document.getElementById('EI-' + evidenceList[i].id);
				const SI=document.getElementById('SI-' + evidenceList[i].id);
				updateEv(evidenceList[i].id, EI.value, SI.value);
			}
		}
    };
    optBtn.replaceWith(saveBtn);
    
    const addE = document.getElementById('AddE-' + id);
    const delBtn = document.createElement('p');
    delBtn.id = 'delBtn-' + id;
    delBtn.classList.add("delBtn");
    delBtn.textContent = "delete";
    delBtn.onclick = function() {
        if(childOf(id)!=-1)
		{
			alert('This node cannote be deleted. It still has attached childs');
		}
		else
		{
			deleteArg(id);
		}
    };
    addE.replaceWith(delBtn);
}


function createArg(Parent) {
    const p = document.getElementById('AddA-' + Parent);
    const AI = document.createElement('input');
    
    AI.id = 'AI-' + Parent;
    AI.classList.add("AssertionInput");
    AI.textContent = '';

    AI.addEventListener('keyup', function onEvent(e) {
        if (event.key === "Enter") {

            var Assertion = AI.value;
            var Reasoning = 'Write here the reasoning';
            supabaseClient
                .from('Argument')
                .insert([{
                    Assertion: Assertion,
                    Reasoning: Reasoning,
                    Parent: Parent
                }])
                .then(function(response) {
                    if (response.error) {
                        console.log('Error adding record:', response.error.message);
                    } else {
                        console.log('Record added successfully:', response.data);
                        document.getElementById('dataForm').reset(); // Reset form
                    }
                });
            fetchRecords();
        }
    });

    p.replaceWith(AI);
}

async function deleteArg(id) {
    const { error } = await supabaseClient.from('Argument').delete().eq('id', id);
    if (error) {
      alert('Error deleting record:'+error);
      return;
    }
    fetchRecords();
 }

async function updateArg(id, Assertion, Reasoning) {
  const { error } = await supabaseClient
    .from('Argument')
    .update([{
                    Assertion: Assertion,
                    Reasoning: Reasoning,
                    Parent: findArg(id).parent
                }])
    .eq('id', id);

  if (error) {
    alert('Error updating record: ' + error.message);
    return;
  }
  fetchRecords();
}


function createEv(parent) {
	
	const EI = document.createElement('input');
    EI.id = 'EI-' + parent;
    EI.classList.add("AssertionInput");
    EI.textContent = '';

    EI.addEventListener('keyup', function onEvent(e) {
        if (event.key === "Enter") {
			supabaseClient
                .from('Evidence')
                .insert([{
                    Explanation: EI.value,
					Source: 'Source missing',
                    Parent: parent
                }])
                .then(function(response) {
                    if (response.error) {
                        console.log('Error adding record:', response.error.message);
                    } else {
                        console.log('Record added successfully:', response.data);
                    }
                });
            fetchRecords();
        }
    });

    document.getElementById('EL-' + parent).appendChild(EI);
}

async function deleteEv(id) {
    const { error } = await supabaseClient.from('Evidence').delete().eq('id', id);
    if (error) {
      alert('Error deleting record:'+error);
      return;
    }
    fetchRecords();
 }

async function updateEv(id, Explanation, Source) {
  const { error } = await supabaseClient
    .from('Evidence')
    .update([{
                    Explanation: Explanation,
                    Source: Source,
                    Parent: findEv(id).parent
                }])
    .eq('id', id);

  if (error) {
    alert('Error updating record: ' + error.message);
    return;
  }
  fetchRecords();
}


function argIdList() {
	var ret=[];
    for (let i = 0; i < argumentList.length; i++) {
        ret.push(argumentList[i].id);
    }
    return ret;
}

function evIdList() {
	var ret=[];
    for (let i = 0; i < evidenceList.length; i++) {
        ret.push(evidenceList[i].id);
    }
    return ret;
}

function findArg(id){
	for(i=0; i<argumentList.length; i++)
	{
		if(argumentList[i].id == id)
			return argumentList[i];
	}
	return null;
}

function findEv(id){
	for(i=0; i<evidenceList.length; i++)
	{
		if(evidenceList[i].id == id)
			return evidenceList[i];
	}
	return null;
}

function childOf(id) {
    for(i=0; i<argumentList.length; i++)
    {
		if(argumentList[i].parent==id)
			return argumentList[i].id;
	}
    return -1;
}

