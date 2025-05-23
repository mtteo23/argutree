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
  constructor(id, assertion, reasoning, parent, confutation) {
	this.id = id;
    this.assertion = assertion; 
    this.reasoning = reasoning;
    this.parent = parent;
    this.confutation = confutation;
  }
}

let headId=0;
let mode="watch";

async function drawGraph(username, project, inpMode) {
	mode=inpMode;
  headId = await fetchHeadId(username, project);
	
	reload();
}

async function reload(focus){
	
	if(focus==null)
		focus=headId;
	
	await fetchRecords();
    
    parent = document.getElementById("graph");
    parent.innerHTML='';
    
    showArg(headId, parent);
    expandArg(focus);
}

async function fetchHeadId(username, project) {
    
    const { data: userData, error: userError } = await supabaseClient
        .from('User')  
        .select('id')
        .eq('username', username)
        .single(); 

    if (userError || !userData) {
        console.error('Error fetching user ID:', userError);
        return null;
    }

    const userId = parseInt(userData.id, 10);
    
    
    const { data: treeData, error: treeError } = await supabaseClient
        .from('Tree')
        .select('head')
        .eq('name', project)
        .eq('user', userId) 
        .single(); 

    if (treeError || !treeData) {
        console.error('Error fetching head ID:', treeError);
        return null;
    }
    
    const headId = parseInt(treeData.head, 10);
	
    return headId;
}

async function fetchRecords() {
	{
		const { data, error } = await supabaseClient.rpc('get_argument_descendants', {
		  p_head_id: headId
		});

		if (error) {
		  console.error("Error fetching descendants:", error);
		} else {
		  //console.log("Descendants:", data);
		}
			
		argumentList=[];
		data.forEach(argument => {
			const newArgument = new Argument(argument.id, argument.Assertion, argument.Reasoning, argument.Parent, argument.Confutation);
			argumentList.push(newArgument);
		});
	}
	
	{
		const { data, error } = await supabaseClient.rpc('get_evidence_for_argument_descendants', {
		  p_head_id: headId
		});

		if (error) {
		  console.error("Error fetching evidence:", error);
		} else {
		  //console.log("Evidence records:", data);
		}
		
		
		evidenceList=[];
		data.forEach(evidence => {
			const newEvidence = new Evidence(evidence.id, evidence.Explanation, evidence.Source, evidence.Parent);
			evidenceList.push(newEvidence);
			});	
	}
}

function showArg(id, parent) {

    //Main div
    const main = document.createElement('div');
    main.id = id;
    main.classList.add("Arg");
    parent.appendChild(main);

    if (id != headId) {
        const upline = document.createElement('div');
        upline.classList.add("vertical-line");
        main.appendChild(upline);
    }

    //trunk div
    const trunk = document.createElement('div');
    trunk.id = 'T-' + id;
    trunk.classList.add("Trunk");
    if(findArg(id).confutation)
      trunk.classList.add("Confutation");
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
	
    for (let i = 0; i < evidenceList.length; i++) {
        if (id==evidenceList[i].parent) {
			showEv(evidenceList[i], el);
        }
    }
    if(mode=="modify")
    {      
      //Button Div
      const but = document.createElement('div');
      but.id = 'B-' + id;
      but.classList.add("BtnDiv");
      expanded.appendChild(but);

      //Add Button Evidence
      const addE = document.createElement('p');
      addE.id = 'AddE-' + id;
      addE.classList.add("AddEvBtn");
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
    }
	
    //Connecting lines
    if(mode=="modify" || nChild(id)>0)
    {    
      const lowline = document.createElement('div');
      lowline.classList.add("vertical-line");
      main.appendChild(lowline);
    }
    
    if(nChild(id)>=2 || (nChild(id)>=1 && mode=='modify'))
    {
      const hline = document.createElement('div');
      hline.classList.add("horizontal-line");
      main.appendChild(hline);
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
    
    if(mode=="modify")
    {     
      const addBtnDiv = document.createElement('div');
      sal.appendChild(addBtnDiv);

      const butupline = document.createElement('div');
      butupline.classList.add("vertical-line");
      addBtnDiv.appendChild(butupline);
      
      //Add Button Argument
      const addA = document.createElement('p');
      addA.id = 'AddA-' + id;
      addA.classList.add("AddArgBtn");
      addA.textContent = "+";
      addA.onclick = function() {
          createArg(addA.id.slice(5))
      };
      addBtnDiv.appendChild(addA); 
    }
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

    const sr = document.createElement('a');
    sr.id = 'SRC-' + evidence.id;
    sr.classList.add("Source");
    sr.href = evidence.source;
    sr.target = "_blank";
    sr.textContent = evidence.source;
    ev.appendChild(sr);
}

function modify(id) {
    const argument = findArg(id);
    const trunk = document.getElementById('T-'+id);
    trunk.innerHTML="";
    const exp = document.createElement('div');
    exp.id='EXP-'+id;
    
    const divA = document.createElement('div');
    divA.classList.add("grow-wrap");
    divA.dataset.replicatedValue = argument.assertion;

    const AI = document.createElement('textarea');
    AI.id = 'AI-' + id;
    AI.classList.add("AssertionModify");
    AI.value = argument.assertion;
    AI.spellcheck = false;
    AI.cols = 30;

    AI.oninput = function() {
        this.parentNode.dataset.replicatedValue = this.value;
    };

    divA.appendChild(AI);
    trunk.appendChild(divA);
    
    
    const divR = document.createElement('div');
    divR.classList.add("grow-wrap");
    divR.dataset.replicatedValue = argument.reasoning;

    const RI = document.createElement('textarea');
    RI.id = 'RI-' + id;
    RI.classList.add("AssertionModify");
    RI.value = argument.reasoning;
    RI.spellcheck = false;
    RI.cols = 30;

    RI.oninput = function() {
        this.parentNode.dataset.replicatedValue = this.value;
    };

    divR.appendChild(RI);
    exp.appendChild(divR);
    
    
    
    const confutationBtn=document.createElement('p');
		confutationBtn.id = 'confBtn-' + id;
		confutationBtn.classList.add("confBtn");
    
    confutationBtn.textContent = "set to Confutation";
    if(findArg(id).confutation)
      confutationBtn.textContent = "set to Argument";
      
		confutationBtn.onclick = function() {
      findArg(id).confutation=!findArg(id).confutation;
      const t=document.getElementById('T-'+id);
      if(findArg(id).confutation)
        t.classList.add('Confutation');
      else
        t.classList.remove('Confutation');
        
      if(findArg(id).confutation)
        this.textContent='set to Argument';
      else
        this.textContent='set to Confutation';
    };
    exp.appendChild(confutationBtn);
    
    
    
    for(i=0; i<evidenceList.length; i++){
      if(evidenceList[i].parent==id){
        const modEvDiv = document.createElement('div');
        modEvDiv.classList.add("grow-wrap");
        modEvDiv.dataset.replicatedValue = argument.assertion;
            
        const EI = document.createElement('textarea');
        EI.id = 'EI-' + evidenceList[i].id;
        EI.classList.add("ExplanationModify");
        EI.value = evidenceList[i].explanation;
        EI.spellcheck = false;
        EI.cols = 24;

        EI.oninput = function() {
          this.parentNode.dataset.replicatedValue = this.value;
        };
        

        const divS = document.createElement('div');
        divS.classList.add("grow-wrap");
        divS.dataset.replicatedValue = argument.reasoning;

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
        
        
        modEvDiv.appendChild(EI);
        modEvDiv.appendChild(divS);
        modEvDiv.appendChild(delEvBtn);
        
        exp.appendChild(modEvDiv);
    }
  }
  
    const but = document.createElement('div');
    but.id = 'B-' + id;
    but.classList.add("BtnDiv");
      
    const saveBtn = document.createElement('p');
    saveBtn.id = 'saveBtn-' + id;
    saveBtn.classList.add("saveBtn");
    saveBtn.textContent = "save";
    saveBtn.onclick = async function() {
        updateArg(id, AI.value, RI.value, argument.confutation);
        for(i=0; i<evidenceList.length; i++){
          if(evidenceList[i].parent==id){	
            const EI=document.getElementById('EI-' + evidenceList[i].id);
            const SI=document.getElementById('SI-' + evidenceList[i].id);
            await updateEv(evidenceList[i].id, EI.value, SI.value);
			}
		}
    };
    but.appendChild(saveBtn);
    
    const delBtn = document.createElement('p');
    delBtn.id = 'delBtn-' + id;
    delBtn.classList.add("delBtn");
    delBtn.textContent = "delete";
    delBtn.onclick = function() {
      if(nChild(id)>0)
      {
        alert('This node cannote be deleted. It still has attached childs');
      }
      else
      {
        deleteArg(id);
      }
    };
    but.appendChild(delBtn);
    exp.appendChild(but);
    
    trunk.appendChild(exp);
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
                    }
                    reload(Parent);
                });
        }
    });

    p.replaceWith(AI);
}

async function deleteArg(id) {
	const parent=findArg(id).parent;
	
    for (let i = 0; i < evidenceList.length; i++) {
        if (id==evidenceList[i].parent) {
			deleteEv(evidenceList[i].id);
        }
    }
    
    const { error } = await supabaseClient.from('Argument').delete().eq('id', id);
    if (error) {
      alert('Error deleting argument:'+error);
      return;
    }
    
    reload(parent);
 }

async function updateArg(id, Assertion, Reasoning, Confutation) {
  const { error } = await supabaseClient
    .from('Argument')
    .update([{
                    Assertion: Assertion,
                    Reasoning: Reasoning,
                    Parent: findArg(id).parent,
                    Confutation: Confutation
                }])
    .eq('id', id);

  if (error) {
    alert('Error updating record: ' + error.message);
    return;
  }
  reload(id);
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
            reload(parent);
        }
    });

    document.getElementById('EL-' + parent).appendChild(EI);
}

async function deleteEv(id) {
	const parent=findEv(id).parent;
    const { error } = await supabaseClient.from('Evidence').delete().eq('id', id);
    if (error) {
      alert('Error deleting evidence:'+error);
      return;
    }
    reload(parent);
 }

async function updateEv(id, Explanation, Source) {
  const { error } = await supabaseClient
    .from('Evidence')
    .update({
      Explanation: Explanation,
      Source: Source,
      Parent: findEv(id).parent
    })
    .eq('id', Number(id));
  if (error) {
    console.log('Error updating record: ' + error.message);
    return;
  }
  reload();
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

function nChild(id) {
  let cont=0;
  for(i=0; i<argumentList.length; i++)
  {
		if(argumentList[i].parent==id)
      cont++;
	}
  return cont;
}


///dragging

const draggable = document.getElementById('graph');
const map = document.getElementById('map');
    
let isDragging = false;
let startX, startY;
let touchStartX, touchStartY;
let offsetX = 0;
let offsetY = 0;

let scale = 1; // Current scale of the image
let lastDistance = 0; // Last pinch distance

function updateTransform() {
  draggable.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

draggable.addEventListener('mousedown', e => {
  isDragging = true;
  startX     = e.clientX;
  startY     = e.clientY;
  draggable.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  startX = e.clientX;
  startY = e.clientY;

  offsetX += dx;
  offsetY += dy;
  updateTransform();
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  draggable.style.cursor = 'grab';
});

map.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }
});

map.addEventListener('touchmove', e => {
  if (e.touches.length === 1) {
    e.preventDefault();
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;

    const dx = tx - touchStartX;
    const dy = ty - touchStartY;
    touchStartX = tx;
    touchStartY = ty;

    offsetX += dx;
    offsetY +=dy;
    updateTransform();
  }
}, { passive: false });

map.addEventListener('wheel', e => {
  e.preventDefault();

  offsetX -= e.deltaX;
  offsetY -= e.deltaY;
  updateTransform();
});

// zoom in phone

map.addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    // Two-finger pinch start
    lastDistance = getDistance(e.touches[0], e.touches[1]);
  }
});

map.addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    e.preventDefault(); // Prevent scrolling while pinching

    const newDistance = getDistance(e.touches[0], e.touches[1]);
    const scaleChange = newDistance / lastDistance; // Ratio of new distance to last distance
    lastDistance = newDistance;

    scale *= scaleChange; // Update the scale
    draggable.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }
}, { passive: false });

map.addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    // Reset when fingers are lifted
    lastDistance = 0;
  }
});

// Helper function to calculate the distance between two touch points
function getDistance(touch1, touch2) {
  const dx = touch1.clientX - touch2.clientX;
  const dy = touch1.clientY - touch2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}


