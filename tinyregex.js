(function (global) {
    "use strict";
    
    function TinyRegex () {}    
    global.TinyRegex = TinyRegex;
    global.TinyRegex.compile = compile;
    global.TinyRegex.match = match;

    function compile(pattern){
        var compiled_patten=[];
        var cursor=0;
        pattern=".*"+pattern;
        for(var i=0;i<pattern.length;i++){
            var cursor=compiled_patten.length;
            switch(pattern[i]){
                case "?":
                    var prev=compiled_patten.pop();
                    compiled_patten.push("split "+(cursor)+" "+(cursor+1));
                    compiled_patten.push(prev);
                    break;
                case "|":
                    var prev=compiled_patten.pop();
                    compiled_patten.push("split "+(cursor)+" "+(cursor+2));
                    compiled_patten.push(prev);
                    compiled_patten.push("jmp "+(cursor+3));
                    compiled_patten.push("char "+pattern[i+1]+"");
                    i++;
                    break;
                case "+":
                    compiled_patten.push("split "+(cursor-1)+" "+(cursor+1));
                    break;
                case "*":
                    if(i==pattern.length-1 || pattern[i+1]!="?"){
                        var prev=compiled_patten.pop();
                        compiled_patten.push("split "+(cursor)+" "+(cursor+2));
                        compiled_patten.push(prev);
                        compiled_patten.push("jmp "+(cursor-1));
                    }else{
                        var prev=compiled_patten.pop();
                        compiled_patten.push("split "+(cursor+2)+" "+(cursor));
                        compiled_patten.push(prev);
                        compiled_patten.push("jmp "+(cursor-1));   
                        i++;
                    }
                    break;
                default:
                    compiled_patten.push("char "+pattern[i]+"");
                    break;
            }
        }        
        compiled_patten.push("match");
        return compiled_patten;
    }
    
    function match(input_str,compiled_pattern){
        var thread =[{sp:0,pc:0}];
        var t=thread.pop();
        var sp=t.sp;
        var pc=t.pc;
        var start=input_str.length;
        while(true){
            var ptn=compiled_pattern[pc].split(" ");
            switch(ptn[0]){
                case "char":
                    if(sp<input_str.length 
                       && ((ptn[1]=="" && input_str[sp]==" ")||   ptn[1]==input_str[sp]||ptn[1]=="." )){
                        if(ptn[1]!="." &&start>sp){
                            start=sp;
                        }
                        sp++;
                        pc++;
                    }else{
                        if(thread.length==0){
                            return undefined;
                        }else{
                            t=thread.pop();
                            sp=t.sp;
                            pc=t.pc;
                        }
                    }
                    break;
                case "jmp":
                    pc=parseInt(ptn[1]);
                    break;
                case "split":
                    pc=parseInt(ptn[1]);
                    thread.push({sp:sp,pc:parseInt(ptn[2])})
                    break;
                case "match":
                    return input_str.substring(start,sp);
                    break;
                default:
                    return undefined;
                    break;
            }
        }
    }
    
})((this || 0).self || global);