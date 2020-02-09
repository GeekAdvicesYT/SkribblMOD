// ==UserScript==
// @name         SkribblMOD
// @description  Ultimate hack for Skribbl (auto-completion, auto-answer [+ Wikipedia/Wiktionary search], empty avatar)
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
width: 100%;
}
#skribblModLogo img{
width: 100%;
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
z-index: 0;
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
padding: 20px;
margin-top: 20px;
margin-bottom: 20px;
background-color: white;
border-radius: 0px;
background-image: url(https://bitbucket.org/GeekAdviceYT/skribblmod/raw/28d5d1a27dfdb2473391cc6beb04dc07046f1c23/dragon.png);
background-repeat: no-repeat;
background-position-x: 108%;
background-position-y: -48px;
background-size: 296px;
min-height: 196px;
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
#autoLearnIA {
cursor: pointer;
background: rgb(255,0,0,0.5);
transition: 0.5s;
border-radius: 10px;
}
#autoLearnIA:hover {
background: rgb(255,0,0,1);
transition: 0.5s;
}
#wikiSearch {
font-weight: bold;
}

`);

$(document).ready(function() {
    let beginOptions={
        activateSkribblMod: "",
        hiddenSkin: "",
        activateAutoTyping: "",
        activateAutocompletion: ""
    };

    let options=(JSON.parse(localStorage.getItem("skribblModOptions"))!==null)?JSON.parse(localStorage.getItem("skribblModOptions")):beginOptions;
    var registerWords=null;
    var gameStart=null;
    var autoGuess=null;

    var selectedLanguage=$("#loginLanguage").val();
    var words;
    var alreadyChoosenWords=[];
    var isNotDrawer;
    var reset=true;
    var searchSentence="";
    var userSentence="";
    var wikiDictionary=[];
    var ajaxRequest;
    var searchingInWiki=false;
    var wikiLanguages={
        English: "en",
        German: "de",
        Bulgarian: "bg",
        Czech: "cs",
        Dansk: "da",
        Dutch: "nl",
        Finnish: "fi",
        French: "fr",
        Estonian: "ee",
        Greek: "gr",
        Hebrew: "he",
        Hungarian: "hu",
        Italian: "it",
        Korean: "ko",
        Latvian: "lv",
        Macedonian: "mk",
        Norwegian: "no",
        Portuguese: "pt",
        Polish: "pl",
        Romanian: "ro",
        Serbian: "sr",
        Spanish: "es",
        Swedish: "sv",
        Tagalog: "tl",
        Turkish: "tr"
    };

    $("html body").prepend(`
<div id="skribblModContainer">
<div id="skribblModMenu">
<div id="skribblMenuOptionsContainer">
<div class="optionContainer">
<label class="option">
<input type="checkbox" id="mainOption" name="activateMod" ${options.activateSkribblMod}>
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
<label class="option">
<input type="checkbox" name="activateAutocompletion" ${options.activateAutocompletion}>
<div class="slide"></div>
</label>
<span>Activer l'auto-complétion</span>
</div>
<div class="optionContainer">
<span id="frequency">Fréquence (ms) :</span>
<input type="number" name="autoGuesserFrequency" id="autoGuesserFrequency" min="1000" step="50" value=1000">
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
            if (options.activateAutocompletion==="checked" && options.activateAutoTyping==="") {
                $(`input[name="activateAutocompletion"]`).click();
            }

            if (options.activateAutoTyping==="") {
                options.activateAutoTyping="checked";
            }
            else {
                options.activateAutoTyping="";
            }

            $("#wordsList").empty();
            $("#wikiSearch").empty();
            localStorage.setItem("skribblModOptions",JSON.stringify(options));
        }
    });

    $(document).on("click",`input[name="activateAutocompletion"]`, () => {
        if (options.activateSkribblMod==="checked") {
            if (options.activateAutoTyping==="checked" && options.activateAutocompletion==="") {
                $(`input[name="activateAutoTyping"]`).click();
            }

            if (options.activateAutocompletion==="") {
                options.activateAutocompletion="checked";
            }
            else{
                options.activateAutocompletion="";
            }

            $("#wordsList").empty();
            $("#wikiSearch").empty();
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

    $(document).on("change","#autoGuesserFrequency", (e) => {
        clearInterval(autoGuess);
        autoGuess=setInterval(autoGuessBOT(),$(e).val());
    });

    function startBOT() {
        if ($("div#screenGame").is(":visible") && !$("#skribblModBox").length) {
            $("div#screenGame").after(`
<div id="skribblModBox" style="display:none">
<div id="wordsList"></div>
</div>`);
            registerWords=setInterval(() => {
                words=(Array.isArray(JSON.parse(GM_getValue("wordsList"))[selectedLanguage]))?JSON.parse(GM_getValue("wordsList")):{};

                if (typeof words[selectedLanguage]==="undefined") {
                    words[selectedLanguage]=[];
                }
                /*
                if ($(".wordContainer").is(":visible")) {
                    let wordContainerWords=$(".wordContainer .word");

                    Object.keys(wordContainerWords).forEach((key) => {
                        if (words[selectedLanguage].indexOf(wordContainerWords[key].innerHTML)<=-1 && wordContainerWords[key].innerHTML!=null) {
                            words[selectedLanguage].push(wordContainerWords[key].innerHTML);
                        }
                    });
                }

                if ($(".content .text:contains('The word was')").length) {
                    if (words[selectedLanguage].indexOf($("#overlay .content .text").text().split(": ")[1])<=-1) {
                        words[selectedLanguage].push($("#overlay .content .text").text().split(": ")[1]);
                    }
                }

                words[selectedLanguage].sort();
*/
                GM_setValue("wordsList",JSON.stringify(words));
            },1000);
        }
    }

    function autoGuessBOT() {
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

        if ($("#autoGuesserFrequency").val()<1000) {
            $("#autoGuesserFrequency").val(1000);
        }

        isNotDrawer=new RegExp("_").test($("#currentWord").text());
        if (typeof words!=="undefined" && typeof words[selectedLanguage]!=="undefined" && isNotDrawer && $("#overlay").css("opacity")==="0" && $("input[name='activateAutoTyping']").is(":checked") && !$("input[name='activateAutocompletion']").is(":checked") && $("input[name='activateMod']").is(":checked") && !$(".player.guessedWord .name:contains('You')").length) {

            let incompleteSentence=unsafeWindow.$("#currentWord").text();
            reset=false;
            let REobj=incompleteSentence.replace(/_/g,".");
            let checkPattern=new RegExp("^"+incompleteSentence.replace(/_/g,"[^ (),\.\-]")+"$","");

            words=words[selectedLanguage].reduce((acc,word) => {
                (checkPattern.test(word) && alreadyChoosenWords.indexOf(word)<=-1)?acc.push(word):null;
                return acc;
            },[]).sort();

            if (words.length) {

                let wordsHTML=words.map((word) => {
                    return $(`<li><span>${word}</li></span>`);
                });
                $("#wordsList").empty().append(wordsHTML);
                unsafeWindow.$("input#inputChat").val($("#wordsList li span").first().text()).submit();
                alreadyChoosenWords.push($("#wordsList li span").first().text());
                $("#wordsList li").first().remove();
            }
            else if ((!wikiDictionary.length && !searchingInWiki) || searchSentence!==$("#currentWord").text()) {
                searchingInWiki=false;
                if (typeof ajaxRequest!=="undefined" && ajaxRequest.state=="pending") {
                    ajaxRequest.stop();
                }
                regexWikiDictionary(REobj,checkPattern);
            }
            else {
                wikiDictionary=wikiDictionary.filter((word) => {
                    return (checkPattern.test(word) && alreadyChoosenWords.indexOf(word)<=-1);
                }).sort();

                let wikiDictionaryHTML=wikiDictionary.map((result) => {
                    return $(`<li><span>${result}</li></span>`);
                });

                $("#wordsList").empty().append(wikiDictionaryHTML);
                unsafeWindow.$("input#inputChat").val($("#wordsList li span").first().text()).submit();
                alreadyChoosenWords.push($("#wordsList li span").first().text());
                $("#wordsList li").first().remove();
            }
        }
        else if ($(".player.guessedWord .name:contains('You')").length || $(".content .text:contains('The word was')").length) {
            wikiDictionary=[];
            searchingInWiki=false;
            $("#wordsList").empty();
            $("#wikiSearch").remove();
        }
    };

    function concatUniqueToArray(arrayOne, arrayTwo) {
        return arrayOne.concat(arrayTwo.filter((item) => arrayOne.indexOf(item)<0));
    }

    function retrieveWikiWords(wikiPattern, pattern, userSentence="", autoCompletion=false, category=0) {
        if (!$("#overlay").is(":visible")) {

            let categories=[`${selectedLanguage}_nouns`,`${selectedLanguage}_proper_nouns`,"Car_brands","Drink_brands","Home_video_game_consoles","Handheld_video_game_consoles"];
            let searchLanguage, url;

            if (typeof wikiLanguages[selectedLanguage]!=="undefined") {
                searchLanguage=wikiLanguages[selectedLanguage];
            }
            else {
                searchLanguage="en";
            }

            if (!autoCompletion) {
                if (category===0) {
                    $("#wordsList").empty();
                    $("#skribblModBox").prepend("<div id='wikiSearch'>Recherche en cours sur Wikipédia ...</div>");
                    searchingInWiki=true;
                }
                else {
                    $("#wikiSearch").text(`Recherche en cours sur ${(category<2)?"Wiktionary":"Wikipédia"} ...`);
                }
                ajaxRequest=$.get(`https://en.${(category<2)?"wiktionary":"wikipedia"}.org/w/api.php?action=query&list=search&format=json&srsearch=intitle:/${wikiPattern}/+incategory:${categories[category]}&srlimit=500&origin=*`, (e) => {
                    wikiDictionary=concatUniqueToArray(wikiDictionary,$(e)[0].query.search.reduce((acc,result) => {
                        (pattern.test(result.title.toLowerCase()))?acc.push(result.title):null;
                        return acc;
                    },[]).sort());

                    let registeredWords=words.map((word) => {
                        return (pattern.test(word) && alreadyChoosenWords.indexOf(word)<=0);
                    });

                    for (let i=0;i<words.length;i++) {
                        (pattern.test(words[i]))?wikiDictionary.unshift(words[i]):null;
                    }

                    let wikiDictionaryHTML=wikiDictionary.map((word) => {
                        return $(`<li><span>${word}</span></li>`);
                    });
                    $("#wordsList").empty().append(wikiDictionaryHTML);

                    if (category<categories.length-1 && !($(".player.guessedWord .name:contains('You')").length && !$(".content .text:contains('The word was')").length) && searchingInWiki) {
                        retrieveWikiWords(wikiPattern, pattern, userSentence, autoCompletion, category+1);
                    }
                    else if (category===categories.length-1) {
                        $("#wikiSearch").remove();
                    }

                });
            }
            else {
                $("#skribblModBox").prepend("<div id='wikiSearch'>Recherche en cours sur Wikipédia ...</div>");
                searchingInWiki=true;
                ajaxRequest=$.get(`https://${searchLanguage}.wikipedia.org/w/api.php?action=opensearch&search=${userSentence}&limit=500&origin=*`, (e) => {
                    if ($(e)[1].length) {
                        wikiDictionary=$(e)[1].reduce((acc,result) => {
                            (pattern.test(result.toLowerCase()))?acc.push(result):null;
                            return acc;
                        },[]).sort();

                        let wikiDictionaryHTML=wikiDictionary.map((word) => {
                            return $(`<li><span>${word}</span></li>`);
                        });
                        $("#wordsList").append(wikiDictionaryHTML);

                    }
                    $("#wikiSearch").remove();
                    searchingInWiki=false;
                });
            }
        }
    }

    function regexWikiDictionary(wikiPattern, pattern, userSentence=null, autoCompletion=false) {
        if (searchSentence!==$("#currentWord").text() || autoCompletion) {
            retrieveWikiWords(wikiPattern, pattern, userSentence, autoCompletion);
            searchSentence=$("#currentWord").text();
        }
    }

    gameStart=setInterval(startBOT,250);
    autoGuess=setInterval(autoGuessBOT,$("#autoGuesserFrequency").val());


    $(document).on("keyup","input#inputChat", (e) => {
        if ($("input[name='activateAutocompletion']").is(":checked") && !($("input[name='activateAutoTyping']").is(":checked")) && $("input[name='activateMod']").is(":checked") && !$("#overlay").is(":visible") && !$(".player.guessedWord .name:contains('You')").length) {
            userSentence=$("input#inputChat").val();
            let incompleteSentence=unsafeWindow.$("#currentWord").text();

            if (incompleteSentence.charAt(userSentence.length)!=="_") {
                e.preventDefault();
                userSentence=userSentence+incompleteSentence.charAt(userSentence.length);

                $("input#inputChat").val(userSentence);
            }


            if (typeof words!=="undefined" && typeof words[selectedLanguage]!=="undefined") {
                let autoCompletionPattern="^";

                wikiDictionary=[];

                for (let i=0;i<incompleteSentence.length;i++) {
                    if (i<userSentence.length) {
                        autoCompletionPattern+=userSentence.charAt(i);
                    }
                    else if (incompleteSentence.charAt(i)==="_") {
                        autoCompletionPattern+="[^ (),\.\-]";
                    }
                    else {
                        autoCompletionPattern+=incompleteSentence.charAt(i);
                    }
                }

                autoCompletionPattern+="$";

                let checkPattern=new RegExp(autoCompletionPattern);

                $("#wordsList").empty()

                if (!wikiDictionary.length) {
                    words=words[selectedLanguage].reduce((acc,result) => {
                        (checkPattern.test(result) && alreadyChoosenWords.indexOf(result)<=-1)?acc.push(`<li><span>${result}</span></li>`):null;
                        return acc;
                    },[]).sort();

                    words=words.map((data) => {
                        return $(data);
                    });

                    $("#wordsList").append(words);
                }

                if (words.length) {
                    unsafeWindow.$("input#inputChat").val($("#wordsList li span").first().text()).submit();
                    alreadyChoosenWords.push($("#wordsList li span").first().text());
                }

                if (typeof ajaxRequest!=="undefined" && ajaxRequest.state=="pending") {
                    ajaxRequest.stop();
                    ajaxRequest=undefined;
                }
                regexWikiDictionary(checkPattern,checkPattern,userSentence,true);
            }
        }
    });

    setInterval(() => {
        if ($("#modalKicked").is(":visible")) {
            if (typeof ajaxRequest!=="undefined") {
                ajaxRequest.stop();
                ajaxRequest=undefined;
            }

            alreadyChoosenWords=[];
            searchSentence="";
            wikiDictionary=[];
            $("#skribblModBox").remove();
        }
    },1000);
});
