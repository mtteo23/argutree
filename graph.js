document.addEventListener('DOMContentLoaded', () => {
    fetchRecords();
});

// Supabase configuration
const SUPABASE_URL = 'https://htbxgsolhsxacotnprjq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Ynhnc29saHN4YWNvdG5wcmpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzQ2MzAsImV4cCI6MjA1NzIxMDYzMH0.OJy9IdF8aWh_YuqU3WIdvuqAX-2GAfTTjMxu9zMAHMo';

// Initialize the Supabase client using the global object
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const evidenceList = [];
class Evidence {
  constructor(id, explanation, source, parent) {
	this.id = id;
    this.explanation = explanation; 
    this.source = source;
    this.parent = parent;
  }
}

const argumentList = [];
class Argument {
  constructor(id, assertion, reasoning, parent) {
	this.id = id;
    this.assertion = assertion; 
    this.reasoing = reasoning;
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
		
		const argData = document.getElementById('argument-data');
		argData.innerHTML='';
		
		data.forEach(argument => {
			argData.innerHTML += '#' + argument.Parent + '-' + argument.id + '{' + argument.Assertion + '}{' + argument.Reasoning + '}\n';
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
		
		data.forEach(evidence => {
			const newEvidence = new Evidence(evidence.id, evidence.Explaination, evidence.Source, evidence.Parent);
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
    ass.textContent = primaryText(id);
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
    res.textContent = secondaryText(id);
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
			
            const ev = document.createElement('div');
            ev.id = evidenceList[i].id;
            ev.classList.add("Evidence");
            ev.textContent = evidenceList[i].explanation;
            el.appendChild(ev);

            const sr = document.createElement('p');
            sr.id = 'SRC-' + evidenceList[i].id;
            sr.classList.add("Source");
            sr.textContent = evidenceList[i].source;
            ev.appendChild(sr);
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
        createEvidence(addE.id.slice(5))
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

    IDs = argIdList();
    for (let i = 0; i < IDs.length; i++) {
        if (argParentOf(IDs[i]) == id) {
            showArg(IDs[i], sal);
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
    IDs = argIdList();
    for (let i = 0; i < IDs.length; i++) {
        val = ""
        if (IDs[i] == id)
            val = "block";
        else
            val = "none";

        document.getElementById('EXP-' + IDs[i]).style.display = val;
    }
}

function createEvidence(parent) {
	
	const EI = document.createElement('input');
    EI.id = 'EI-' + parent;
    EI.classList.add("AssertionInput");
    EI.textContent = '';

    EI.addEventListener('keyup', function onEvent(e) {
        if (event.key === "Enter") {
			supabaseClient
                .from('Evidence')
                .insert([{
                    Explaination: EI.value,
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

function expandOption(id) {
    modifyArg(id);
}

function argParentOf(id) {
    rows = listArg();

    if (rows[0].length == 0) {
        rows = rows.slice(1);
    }

    for (let i = 0; i < rows.length; i++) {
        let ind = rows[i].search("{");
        let tmp = rows[i].slice(0, ind).trim();
        ind = tmp.search("-");
        let parent = tmp.slice(0, ind);
        let child = tmp.slice(ind + 1);
        if (child == id) {
            return parent;
        }
    }
    return -1;
}

function childOf(id) {
    rows = listArg();

    if (rows[0].length == 0) {
        rows = rows.slice(1);
    }

    for (let i = 0; i < rows.length; i++) {
        let ind = rows[i].search("{");
        let tmp = rows[i].slice(0, ind).trim();
        ind = tmp.search("-");
        let parent = tmp.slice(0, ind);
        let child = tmp.slice(ind + 1);
        if (parent == id) {
            return child;
        }
    }
    return -1;
}

function argIdList() {
    rows = listArg();

    if (rows[0].length == 0) {
        rows = rows.slice(1);
    }

    for (let i = 0; i < rows.length; i++) {
        let start = rows[i].search("-") + 1;
        let end = rows[i].search("{");
        rows[i] = rows[i].slice(start, end).trim();
    }
    return rows;
}

function evIdList() {
	var ret=[];
    for (let i = 0; i < evidenceList.length; i++) {
        ret.push(evidenceList[i].id);
    }
    return ret;
}

function primaryText(id) {
    rows = listArg();

    for (let i = 0; i < rows.length; i++) {
        let start = rows[i].search("-") + 1;
        let ind = rows[i].search("{");
        if (rows[i].slice(start, ind).trim() == id) {
            end = rows[i].search("}{");
            return rows[i].slice(ind + 1, end);
        }
    }
    return "ERRORE!!";
}

function secondaryText(id) {
    rows = listArg();

    for (let i = 0; i < rows.length; i++) {
        let start = rows[i].search("-") + 1;
        let ind = rows[i].search("{");
        if (rows[i].slice(start, ind).trim() == id) {
            ind = rows[i].search("}{") + 2;
            let end = rows[i].slice(ind).search("}");
            return rows[i].slice(ind, ind + end);
        }
    }
    return "ERRORE!!";
}

function appArg(id, prim, sec) {
    toAdd = '#' + id + '{' + prim + '}{' + sec + '}\n';
    document.getElementById('argument-data').append(toAdd);
}

function modifyArg(id) {
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
    
    const optBtn = document.getElementById('OPT-' + id);
    const saveBtn = document.createElement('p');
    saveBtn.id = 'saveBtn-' + id;
    saveBtn.classList.add("saveBtn");
    saveBtn.textContent = "save";
    saveBtn.onclick = function() {
        updateArg(id, AI.value, RI.value);
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
                    Parent: argParentOf(id)
                }])
    .eq('id', id);

  if (error) {
    alert('Error updating record: ' + error.message);
    return;
  }

  fetchRecords();
}

function subAss(id, arg) {
    rows = document.getElementById('argument-data').textContent;
    fID = '';
    pos = 0;
    while (fID != id) {
        txt = rows.slice(pos + 1);
        fID = txt.slice(0, txt.search('{'));
        if (fID != id) {
            pos += txt.search('\n') + 1;
        }
    }
    beforeRows = rows.slice(0, pos);
    afterRows = txt.slice(txt.search('\n') + 1);
    final = beforeRows + '\n#' + id + '{' + arg + '}{' + secondaryText(id) + '}\n' + afterRows;
    document.getElementById('argument-data').textContent = final;
}

function subRes(id, arg) {
    rows = document.getElementById('argument-data').textContent;
    fID = '';
    pos = 0;
    while (fID != id) {
        txt = rows.slice(pos + 1);
        fID = txt.slice(0, txt.search('{'));
        if (fID != id) {
            pos += txt.search('\n') + 1;
        }
    }
    beforeRows = rows.slice(0, pos);
    afterRows = txt.slice(txt.search('\n') + 1);
    final = beforeRows + '\n#' + id + '{' + primaryText(id) + '}{' + arg + '}\n' + afterRows;
    document.getElementById('argument-data').textContent = final;
}

function listArg() {
    rows = document.getElementById('argument-data').textContent;
    rows = rows.split("#");

    rows = rows.slice(1);

    for (i = 0; i < rows.length; i++) {
        rows[i] = rows[i].trim();
    }

    return rows;
}
