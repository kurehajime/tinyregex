(function (global) {
    "use strict";
    
    function TinyRegex () {}    
    global.TinyRegex = TinyRegex;
    global.TinyRegex.compile = compile;
    global.TinyRegex.match = match;
    global.TinyRegex.getBracketsString=getBracketsString;
    global.TinyRegex.shiftPattern=shiftPattern;
    
    function compile(pattern){
        var compiled_patten=[];
        var cursor=0;
        var prev;
        pattern=".*"+pattern;
        for(var i=0;i<pattern.length;i++){
            cursor=compiled_patten.length;
            switch(pattern[i]){
                case "?":
                    prev=compiled_patten.pop();
                    compiled_patten.push("split "+(cursor)+" "+(cursor+1));
                    compiled_patten.push(prev);
                    break;
                case "|":
                    prev=compiled_patten.pop();
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
                        prev=compiled_patten.pop();
                        compiled_patten.push("split "+(cursor)+" "+(cursor+2));
                        compiled_patten.push(prev);
                        compiled_patten.push("jmp "+(cursor-1));
                    }else{
                        prev=compiled_patten.pop();
                        compiled_patten.push("split "+(cursor+2)+" "+(cursor));
                        compiled_patten.push(prev);
                        compiled_patten.push("jmp "+(cursor-1));   
                        i++;
                    }
                    break;
                case "(":
                    var packedStr=getBracketsString(pattern,i);
                    if(packedStr!=""){
                        compiled_patten.push("pack "+packedStr+"");
                        i+=packedStr.length+1;
                        break;    
                    }
                    //break;   
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
    /*
    function unPack(compiled_pattern){
        var rtnPattern=compiled_pattern.concat();
        var ptn;
        for(var i=0;i<rtnPattern.length;i++){
            ptn =rtnPattern[i].split(" ");
            if(ptn[0]=="pack"){
                var unpacked=compile(ptn[1]);
                unpacked=unpacked.splice(3,unpacked.length-4);
                var arr1=rtnPattern.slice(0,i)
                var arr2=shiftPattern(unpacked,i-3);
                var arr3=shiftPattern(rtnPattern.slice(i+1,compiled_pattern.length),arr2.length-3)
                rtnPattern=[];
                rtnPattern=rtnPattern.concat(arr1)
                rtnPattern=rtnPattern.concat(arr2)
                rtnPattern=rtnPattern.concat(arr3)
            }
        }
        return rtnPattern;
    }
    */
    function shiftPattern(compiled_pattern,inc){
        var ptn;
        var rtnPattern=[];
        for(var i=0;i<compiled_pattern.length;i++){
            ptn=compiled_pattern[i].split(" ");
            switch(ptn[0]){
                case "jmp":
                    rtnPattern.push("jmp "+(parseInt(ptn[1])+inc))
                    break;
                case "split":
                    rtnPattern.push("split "+(parseInt(ptn[1])+inc)+" "+(parseInt(ptn[2])+inc))
                    break;
                default:
                    rtnPattern.push(compiled_pattern[i]);
                    break;
            }
        }
        return rtnPattern;
    }
    
    function getBracketsString(str,idx){
        var startCount=0;
        var endCount=0;
        var rtnStr="";
        for(var i=idx;i<=str.length;i++){
            if(str[i]=="("){
                startCount++;
                if(startCount==1){
                    continue;
                }
            }else if(str[i]==")"){
                endCount++;
                if(startCount!=0&&startCount==endCount){
                    break;
                }                
            }
            if(startCount!=0){
                rtnStr+=str[i];            
            }
        }    
        if(startCount==endCount){
            return rtnStr;
        }else{
            return "";
        }
    }
    
})((this || 0).self || global);