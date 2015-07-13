(function (global) {
    "use strict";
    
    function TinyRegex () {}    
    global.TinyRegex = TinyRegex;
    global.TinyRegex.compile = compile;
    
    function compile(pattern){
        var compiled_patten=[];
        var cursor=0;
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
    
    function vm(input_str,compiled_pattern){
        //    
    }
    
    
})((this || 0).self || global);

$(function(){
    $("#compile").click(function(e){
        var compiled_patten= TinyRegex.compile($("#pattern_text").val())
        var str="";
        for(var i=0;i<compiled_patten.length;i++){
            str+= i +" : "+ compiled_patten[i]+"\n";
        }
        $("#compiled_text").val(str);
    })
});

