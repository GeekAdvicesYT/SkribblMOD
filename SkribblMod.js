// ==UserScript==
// @name         SkribblMOD
// @version      0.2
// @description  Enjoy the hack power !
// @author       GeekAdviceYT
// @match        https://skribbl.io/*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

let $=window.jQuery;

GM_addStyle(
        `#skribblModContainer {
           position: fixed;
           width: 100%;
           z-index: 10;
         }
         #skribblMenuOptionsContainer {
           display: flex;
           flex-flow: column;
           flex-wrap: wrap;
           width: 200%;
         }
         #skribblMenuOptionsContainer > * {
           flex: 50%;
         }
         #skribblModMenu {
           padding: 20px;
           width: 100%;
           background: black;
           background-color: rgb(0,0,0,0.5);
           display: none;
           column-count: 3;
         }
         #skribblModMenu span {
           color: white;
         }
         #skribblModLogo {
           position: relative;
           left: 100%;
         }
         #fadeBoxSkribblMod {
           width: 96px;
           position: absolute;
           right: 0;
           text-align: center;
           background-color: rgb(0,0,0,0.5);
           border-bottom-left-radius: 16px;
           border-bottom-right-radius: 16px;
         }
         #audio {
           z-index: -1;
         }
         .skribblModOptions, .optionContainer {
           display: flex;
           align-items: center;
         }
         .optionContainer span {
           font-size: large;
           margin: 10px;
         }
         .optionContainer input[type="checkbox"] {
           width: 100%;
         }
         .option {
           position: relative;
           display: inline-block;
           width: 60px;
           height: 32px;
         }
         .slide {
           position: absolute;
           top: 0;
           left: 0;
           background-color: gray;
         }
         .slide:before {
           content: "";
           top: 4px;
           left: 4px;
           background-color: white;
           width: 26px;
           height: 26px;
         }
         .slide:before, .slide {
           position: absolute;
           right: 0;
           bottom: 0;
           transition: 0.4s;
           border-radius: 30px;
         }
         input[type="checkbox"] {
           width: 100%;
         }
         input:checked+.slide {
           background-color: green;
         }
         input:checked + .slide:before {
           transform: translateX(26px);
         }
         input[type="checkbox"] {
           width: 0;
         }
         .hideObject {
           visibility: hidden;
         }
         #skribblModBox {
           display: flex;
           padding: 20px;
           margin-top: 20px;
           background-color: white;
           border-radius: 0px;
         }
         #wordsList {
           width: 75%;
           column-count: 3;
         }
         i {
           border: solid white;
           border-width: 0 3px 3px 0;
           display: inline-block;
           padding: 3px;
         }
         .down {
           transform: rotate(45deg);
           -webkit-transform: rotate(45deg);
         }
         .up{
           transform: rotate(225deg);
           -webkit-transform: rotate(225deg);
         }

`);

$(document).ready(function() {
    let beginOptions={
        activateSkribblMod: "",
        hiddenSkin: "",
        activateAutoTyping: ""
    };

    let options=(JSON.parse(localStorage.getItem("skribblModOptions"))!==null)?JSON.parse(localStorage.getItem("skribblModOptions")):beginOptions;

    var selectedLanguage=$("#loginLanguage").val();

    $("body").prepend(
    `<div id="skribblModContainer">
       <div id="skribblModMenu">
         <div id="skribblMenuOptionsContainer">
           <div class="optionContainer">
             <label class="option">
               <input type="checkbox" name="activateMod" ${options.activateSkribblMod}>
               <div class="slide"></div>
             </label>
             <span>Activer SkribblMod</span>
           </div>
           <div class="optionContainer">
             <label class="option">
               <input type="checkbox" name="hiddenSkin" ${options.hiddenSkin}>
               <div class="slide"></div>
             </label>
             <span>Avatar invisible</span>
           </div>
           <div class="optionContainer">
             <label class="option">
               <input type="checkbox" name="activateAutoTyping" ${options.activateAutoTyping}>
               <div class="slide"></div>
             </label>
             <span>Activer la saisie automatique</span>
           </div>
           <div class="optionContainer">
             <span id="frequency">Fréquence (ms) :</span>
             <input type="number" name="autoGuesserFrequency" id="autoGuesserFrequency" min="1150" step="50" value="1500">
           </div>
         </div>
         <div id="skribblModLogo">
           <img src="https://bitbucket.org/GeekAdviceYT/skribblmod/raw/263ec9532e2c54c630cd6e11abe1d2f0e3eb1326/SkribblMod.png" alt="Logo SkribblMod" />
         </div>
       </div>
       <div id="fadeBoxSkribblMod">
         <i class="arrow down"></i>
       </div>
     </div>`);

    if (options.activateSkribblMod!=="") {
        if (options.hiddenSkin!=="") {
            $(".avatarContainer").addClass("hideObject");
        }
    }
    else {
        $(".option input").not(`.option input[name="activateMod"]`).prop("disabled",true);
        localStorage.setItem("avatar","[2,2,2,-1]");
    }

    $(document).on("click",`input[name="activateMod"]`, () => {
        if (options.activateSkribblMod==="") {
            options.activateSkribblMod="checked";
            if (options.hiddenSkin) {
                $(".avatarContainer").addClass("hideObject");
            }
            $(".option input").not(`.option input[name="activateMod"]`).removeAttr("disabled");
        }
        else {
            options.activateSkribblMod="";
            $(".avatarContainer").removeClass("hideObject");
            $(".option input").not(`.option input[name="activateMod"]`).prop("disabled",true);
        }
        localStorage.setItem("skribblModOptions",JSON.stringify(options));
    });


    $(document).on("click",`input[name="hiddenSkin"]`, () => {
        if (options.activateSkribblMod==="checked") {
            if (options.hiddenSkin==="") {
                options.hiddenSkin="checked";

                localStorage.setItem("avatar","[-1,-1,-1,-1]");
            }
            else{
                options.hiddenSkin="";
                localStorage.setItem("avatar","[2,2,2,-1]");
            }

            localStorage.setItem("skribblModOptions",JSON.stringify(options));
        }
        location.reload();
    });

    $(document).on("click",`input[name="activateAutoTyping"]`, () => {
        if (options.activateSkribblMod==="checked") {
            if (options.activateAutoTyping==="") {
                options.activateAutoTyping="checked";$
            }
            else{
                options.activateAutoTyping="";
            }

            localStorage.setItem("skribblModOptions",JSON.stringify(options));
        }
    });

    $(document).on("change","#loginLanguage", () => {
        selectedLanguage=$("#loginLanguage").val();
    });

    $(document).on("click","#fadeBoxSkribblMod", () => {
        $("#skribblModMenu").slideToggle(500);
        if ($("#fadeBoxSkribblMod i").hasClass("down")) {
            $("#fadeBoxSkribblMod i").removeClass("down").addClass("up");
            $("#skribblModMenu *").css("opacity","0");
            setTimeout(() => {
                $("#skribblModMenu *").show().fadeTo(500,1);
            },500);
        }
        else {
            $("#fadeBoxSkribblMod i").removeClass("up").addClass("down");
            $("#skribblModMenu *").fadeTo(100,0);
        }
    });

    var gameStart=setInterval(() => {
        var words;
        var alreadyChoosenWords=[];
        var isNotDrawer;
        var reset=true;

        if ($("div#screenGame").length) {
            $("div#screenGame").after(
            `<div id="skribblModBox" style="display:none">
               <div id="wordsList"></div>
             </div>`);
            clearInterval(gameStart);
            gameStart=null;
            var registerWords=setInterval(() => {
                console.log(JSON.parse(GM_getValue("wordsList")).selectedLanguage);
                words=(Array.isArray(JSON.parse(GM_getValue("wordsList"))[selectedLanguage]))?JSON.parse(GM_getValue("wordsList")):{};

                console.log(words);
                if ($(".wordContainer").is(":visible")) {
                    let wordContainerWords=$(".wordContainer .word");
                    Object.keys(wordContainerWords).forEach((key) => {
                        if (typeof words[selectedLanguage]!=="undefined") {
                            if (words[selectedLanguage].indexOf(wordContainerWords[key].innerHTML)<=-1 && wordContainerWords[key].innerHTML!=null) {
                                words[selectedLanguage].push(wordContainerWords[key].innerHTML);
                            }
                        }
                        else {
                            words[selectedLanguage]=[wordContainerWords[key].innerHTML];
                        }
                    });
                }

                if ($(".content .text:contains('The word was')").length) {
                    if (words[selectedLanguage].indexOf($("#overlay .content .text").text().split(": ")[1])<=-1) {
                        words[selectedLanguage].push($("#overlay .content .text").text().split(": ")[1]);
                    }
                }

                GM_setValue("wordsList",JSON.stringify(words));
            },$("#autoGuesserFrequency").val());

            var autoGuess=setInterval(() => {
                if ($("#overlay").css("opacity")>0) {
                    alreadyChoosenWords=[];
                    $("#wordsList").empty();
                }

                if ($("#screenGame").is(":visible")) {
                    $("#skribblModBox").css({display: ""});
                }
                else {
                    $("#skribblModBox").css({display: "none"});
                }

                if ($("#autoGuesserFrequency").val()<1150) {
                    $("#autoGuesserFrequency").val(1150);
                }

                isNotDrawer=new RegExp("_").test($("#currentWord").text());

                if (typeof words!=="undefined" && words[selectedLanguage].length>0 && isNotDrawer && $("#overlay").css("opacity")==="0" && ($("input[name='activateAutoTyping']").is(":checked")||reset)) {
                    let incompleteSentence=unsafeWindow.$("#currentWord").text();
                    reset=false;

                    words=words[selectedLanguage].filter((word) => {
                        let checkPattern=new RegExp(incompleteSentence.replace(/_/g,"."),"");
                        return checkPattern.test(word) && word.length===incompleteSentence.length && alreadyChoosenWords.indexOf(word)<=-1;
                    });

                    $("#wordsList").empty();

                    if (words.length) {
                        let appendWords=words.map((word) => {
                            return $(`<li><span>${word}</li></span>`);
                        });

                        $("#wordsList").append(appendWords);
                        unsafeWindow.$("input#inputChat").val($("#wordsList li span").first().text()).submit();
                        alreadyChoosenWords.push($("#wordsList li span").first().text());
                        $("#wordsList li").first().remove();
                    }
                }
            },$("#autoGuesserFrequency").val());
        }
    },500);
});
