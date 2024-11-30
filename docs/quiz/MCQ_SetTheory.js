MC.AddMCQ([
{
  Cat: "Set Theory", Lvl:"O",
  Q: ['What is the cardinality of the set: '+
'`{«a|b|c|{a, b, c}», «{{x, y, z}}|{d, e}|q», «{h, i, j}|p», «k|{k}» «$A_, {{a}, {b}}|, {}, {a}|»}`'
  ], Inf:"Cardinality",
  A:['«$A_5|6|4»'],
  Bad:[''],
  More:"Cardinality of a set is the count of its elements.<br>Even if an element is a set, it is still counted as 1 element."
},
{
  Lvl:"O",
  Q: [
'Consider the following sets:'+
'<p>`A = {{a, b, c}, {a, b}, a, b, c}`<br>'+
'   `B = {a, {b, c}, {a}, b, {a, b, c}}`<br>'+
'   `C = {a, b, {a, b, c}}`<br>'+
'</p><p>Which of the following is/are true?</p>'+
'<ol type="I">'+
'<li>`«A sub B¿B sub A¿A cup C = B¿|A| > |B|»`</li>'+
'<li>`«$A_ |A setminus B| = 2  ¿ (A cap B) cup C != A cap (B cup C)»`</li>'+
'<li>`«A cap B = C ¿ |A cup B| = |A| + |B| -|C|»`</li>'+
'<li>`«A cap C = C | A sup C| B sup C| C sub A| C sub B»`</li>'
  ], Inf:"Cardinality",
  A:['«$A_II III and IV only| III IV only»'],
  Bad:['II only', 'I IV only', 'II IV only', 'III only', 'All of them', 'None of them', 'IV only'],
  More:'`setminus` is the set difference operator<br>'
},
{
  Lvl:"O",
  Q: [
'What is true about the Power Set `cc "P"(A)` of the set `A`:'+
'<p>`A = «$X_{{a, b, c}, {a, b}, a, b, c}|'+
            '{{{a},{b},{c}}}|'+
            '{a, {b, c}, {a}, b, {a, b, c}}»`<br>'+
'</p>'+
'<ol type="I">'+
'<li>`«$X_ {a, b}|{{a}, {b}, {c}}| {b}» in cc"P"(A)`</li>'+               // true|false|true
'<li>`«$X_ {{b, c}} | {a} | a » in cc"P"(A)`</li>'+                       // false
'<li>`«$X_ {{a, b, c}} | {{{a},{b},{c}}} | {b, c} » sub cc"P"(A)`</li>'+  // true|false|false
'<li>`«$Y_{A} sub| {} sub | {{{a, b, c}}} sub » cc"P"(A)`</li>'+          // true|true|true
'<li>`|cc"P"(A)| = «$X_ 32|8|32»`'                                        // true|false|true
  ], Inf:"Cardinality",
  A:['«$X_I III IV and V | IV only |I IV and V only»'],
  Bad:['II IV and V only', 'I III and V only', 'I II IV only', 'III and V only', 'I only', 'All of them', 'None of them'],
  More: "The elements of a Power Set are sets.<br>Therefore there can never be individual non-set items in a power set.<br>"+
  "The empty set `{}` or `O/` is a subset of any set, therefore it is also a subset of the power set.<br>"+
  '«$Y_`A in cc"P"(A) :. {A} sub cc"P"(A)`| | `{{a, b, c}} in cc"P"(A) :. {{{a, b, c}}} sub cc"P"(A)`»'
},
{
  Lvl:"O",
  Q: [
'Which of the following statements is/are true:<ol type="I">'+
'<li>«`RR xx RR` is the set of all possible ordered-pairs of real numbers.|'+
'`RR xx RR xx RR` is the 3D real-coordinate space»</li>'+
'<li>`P sub Q => «P xx P sub Q xx Q|P xx P sub P xx Q|P xx Q sub Q xx Q»`</li>'+
'<li>`(x, y, z) = (x, (y, z)) = ((x, y), z) `</li>'
  ], Inf:"Ordered-tuples",
  A:['I and II only'],
  Bad:['I only', 'I and III only', 'II and III only', 'III only', 'All of them', 'None of them'],
  More:
  "While it true that an n-tuple can be defined as nested pairs, e.g.:<br>"+
  "`(x, y, z) = (x, (y, z))` or `(x, y, z) = ((x, y), z)`,<br> only one definition can be adopted but not both and interchangeably.<br>"
},

{
  Lvl:"O",
  Q: ['Which of the following functions is a bijection?'],
  A:[
  '`f:(-pi,pi)->RR; x mapsto tan(x)`',
  // '`f:[0,pi]->[-1,1]; x mapsto cos(x)`',
  '`f:RR->RR; x mapsto x^3`'
  ], Inf:"Bijection",
  Bad:[
    '`f:[0,pi]->[0,1]; x mapsto sin(x)`',
    '`f:RR->RR; x mapsto x^2`',
    '`f:ZZ->ZZ; x mapsto n xx x`',
    '`f:ZZ->NN; x mapsto abs(x)`',
    '`f:NN->NN; x mapsto x+1`',
  ],
},

{
  Lvl:"O",
  Q: [
'Which of the following is/are true about the function:<br>'+
'`f:RR->RR; x mapsto 3x^k` - 1, where `k` is positive and «odd|even» <ol type="I">'+
'<li>`f` is injective</li>'+          // true | false
'<li>`f` is surjective</li>'+         // true | false
'<li>`f` is a bijection</li>'+        // true | false
'<li>`f` is a partial function</li>'  // false| false
    ],
  A:[
    '«I II and III only|None of them»'
    ], Inf:"Bijection",
  Bad:[
    'I and III',
    'All of them',
    'II and III',
    'I and IV',
    'II and IV',
    'I only',
    'II only',
  ],
},

{
  Lvl:"O",
  Q: [
'What is the cardinality of the set of all 3D integer coordinates?<br>'+
'In other words, what is `|ZZ^3|` ?'
    ],
  A:[
    'The same as `|NN|` i.e. `aleph_0`'
    ], Inf:"Cardinality",
  Bad:[
    'The same as `|RR|` i.e. `aleph_1`',
    'Unknown',
    'The cardinality of the set of transcendental numbers',
  ],
},

]);
