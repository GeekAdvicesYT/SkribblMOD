if (document.title.indexOf("skribbl.io")>=0) {
    // ==UserScript==
    // @name         SkribblMOD
    // @description  Enjoy the hack power !
    // @author       GeekAdviceYT
    // @match        https://skribbl.io/*
    // @require      https://code.jquery.com/jquery-3.4.1.min.js
    // @grant        GM_addStyle
    // @grant        GM_setValue
    // @grant        GM_getValue
    // ==/UserScript==

    let $=window.jQuery.noConflict(true);
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
background-image: url(https://raw.githubusercontent.com/GeekAdvicesYT/SkribblMOD/master/dragon.png);
background-repeat: no-repeat;
background-position-x: 108%;
background-position-y: -48px;
background-size: 296px;
min-height: 196px;
}
#skribblModBox a {
color: blue;
cursor: pointer;
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
#regexError {
font-weight: bold;
color: red;
}

`);

    $(function() {
        let beginOptions={
            activateSkribblMod: "",
            hiddenSkin: "",
            activateAutoTyping: "",
            activateAutocompletion: ""
        };

        let options=(JSON.parse(localStorage.getItem("skribblModOptions"))!==null)?JSON.parse(localStorage.getItem("skribblModOptions")):beginOptions;
        var registerWords=undefined;
        var gameStart=undefined;
        var autoGuess=undefined;

        var selectedLanguage=$("#loginLanguage").val();
        var words;
        var acWords;
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

        function resetAI() {
            if (ajaxRequest!==undefined) {
                ajaxRequest.abort();
            }

            wikiDictionary=[];
            words=[];
            acWords=[];
            alreadyChoosenWords=[];
            searchSentence="";
            userSentence="";
            searchingInWiki=false;
        }

        function concatUniqueToArray(arrayOne, arrayTwo) {
            return arrayOne.concat(arrayTwo.filter((item) => arrayOne.indexOf(item)<0));
        }

        function retrieveWikiWords(wikiPattern, pattern, userSentence="", autoCompletion=false, category=0) {
            if (searchSentence!==$("#currentWord").text() || autoCompletion || category>0) {
                if (!$("#overlay").is(":visible")) {
                    let categories=[`${selectedLanguage}_nouns`,"Car_brands","Drink_brands","Home_video_game_consoles","Handheld_video_game_consoles"];
                    let excludeCategories={
                        French: "+-incategory:English_nouns",
                        English: "+-incategory:French_nouns"
                    }
                    let searchLanguage, url;

                    if (typeof wikiLanguages[selectedLanguage]!=="undefined") {
                        searchLanguage=wikiLanguages[selectedLanguage];
                    }
                    else {
                        searchLanguage="en";
                    }

                    if (category===0) {
                        if (!autoCompletion) {
                            $("#wordsList").empty();
                        }

                        $("#skribblModBox").prepend("<div id='wikiSearch'>Recherche en cours sur Wiktionary ...</div>");
                        searchingInWiki=true;
                    }
                    else {
                        $("#wikiSearch").text(`Recherche en cours sur ${(category<2)?"Wiktionary":"Wikipédia"} ...`);
                    }

                    ajaxRequest=$.get(`https://en.${(category<2)?"wiktionary":"wikipedia"}.org/w/api.php?action=query&list=search&format=json&srsearch=intitle:/${wikiPattern}/+incategory:${categories[category]}+&srlimit=500&origin=*`, (e) => {
                        if ($(e).length) {
                            if (!autoCompletion) {
                                wikiDictionary=concatUniqueToArray(wikiDictionary,$(e)[0].query.search.reduce((acc,result) => {
                                    (pattern.test(result.title.toLowerCase()) && alreadyChoosenWords.indexOf(result.title.toLowerCase()))?acc.push(result.title):null;
                                    return acc;
                                },[]).sort());
                            }
                            else {
                                if (searchingInWiki) {
                                    acWords=concatUniqueToArray(acWords,$(e)[0].query.search.reduce((acc,result) => {
                                        (pattern.test(result.title.toLowerCase()) && alreadyChoosenWords.indexOf(result.title.toLowerCase()))?acc.push(result.title):null;
                                        return acc;
                                    },[]).sort());

                                    $("#wordsList").empty().append(acWords.map((word) => {
                                        return $(`<li><span><a>${word}</a></li></span>`);
                                    }));
                                }
                            }

                            if (category<categories.length-1 && !($(".player.guessedWord .name:contains('You')").length && $(".content .text:contains('The word was')").length) && searchingInWiki) {
                                retrieveWikiWords(wikiPattern, pattern, userSentence, autoCompletion, category+1);
                            }
                            else if (category===categories.length-1 || !searchingInWiki) {
                                $("#wikiSearch").remove();
                                searchingInWiki=false;
                            }
                        }
                    });
                }
                searchSentence=$("#currentWord").text();
            }
        }

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

                    GM_setValue("wordsList",JSON.stringify(words));
                },1000);
            }
        }

        function autoGuessBOT() {
            if ($("#overlay").css("opacity")>0) {
                alreadyChoosenWords=[];
                acWords=[];
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
            if (typeof words!=="undefined" && typeof words[selectedLanguage]!=="undefined" && isNotDrawer && $("#overlay").css("opacity")==="0" && $("input[name='activateAutoTyping']").is(":checked") && !$("input[name='activateAutocompletion']").is(":checked") && $("input[name='activateMod']").is(":checked") && !$(".player.guessedWord .name:contains('You')").length) {
                let incompleteSentence=unsafeWindow.$("#currentWord").text();
                reset=false;
                let REobj=incompleteSentence.replace(/_/g,".");
                let checkPattern=new RegExp("^"+incompleteSentence.replace(/_/g,"[^ (),\.\'\-]")+"$","");

                words=words[selectedLanguage].reduce((acc,word) => {
                    (checkPattern.test(word) && alreadyChoosenWords.indexOf(word)<=-1)?acc.push(word):null;
                    return acc;
                },[]).sort();

                let wikiDictionaryHTML;
                let wordsHTML;

                if ((!wikiDictionary.length && !searchingInWiki) || searchSentence!==$("#currentWord").text()) {
                    if (searchingInWiki) {
                        ajaxRequest.abort();
                    }
                    searchingInWiki=false;
                    retrieveWikiWords(REobj,checkPattern);
                }

                if (wikiDictionary.length) {
                    words=concatUniqueToArray(words,wikiDictionary.reduce((acc,word) => {
                        (checkPattern.test(word) && alreadyChoosenWords.indexOf(word)<=-1)?acc.push(word):null;
                        return acc;
                    },[]).sort());



                    wordsHTML=words.map((word) => {
                        return $(`<li><span><a>${word}</a></span></li>`);
                    });
                }
                else {
                    wordsHTML=words.map((word) => {
                        return $(`<li><span><a>${word}</a></li></span>`);
                    });
                }

                $("#wordsList").empty().append(wordsHTML);

                let typedWordIndexInArray=words.indexOf($("#inputChat").val());
                if (typedWordIndexInArray>=0) {
                    unsafeWindow.$("input#inputChat").submit();
                    alreadyChoosenWords.push($("#inputChat").val());
                    $("#wordsList li").eq(typedWordIndexInArray).remove();
                }
                else if (words.length) {
                    unsafeWindow.$("input#inputChat").val($("#wordsList li span").first().text()).submit();
                    alreadyChoosenWords.push($("#wordsList li span").first().text());
                    $("#wordsList li").first().remove();
                }

            }
            else if ($(".player.guessedWord .name:contains('You')").length || $(".content .text:contains('The word was')").length) {
                resetAI();
                $("#wordsList").empty();
                $("#wikiSearch").remove();
            }
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
<input type="number" name="autoGuesserFrequency" id="autoGuesserFrequency" min="1150" step="50" value=1150">
</div>
</div>
<div id="skribblModLogo">
<img src="https://raw.githubusercontent.com/GeekAdvicesYT/SkribblMOD/master/SkribblMod.png" alt="Logo SkribblMod" />
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

                resetAI();
                $("#wikiSearch").remove();
                $("#regexError").remove();
                $("#wordsList").empty();
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

                resetAI();
                $("#wikiSearch").remove();
                $("#regexError").remove();
                $("#wordsList").empty();
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
            autoGuess=setInterval(autoGuessBOT,$("#autoGuesserFrequency").val());
        });


        gameStart=setInterval(startBOT,250);
        autoGuess=setInterval(autoGuessBOT,$("#autoGuesserFrequency").val());

        $(document).on("keydown","input#inputChat", (e) => {
            if (e.keyCode===13) {
                isNotDrawer=new RegExp("_").test($("#currentWord").text());

                if (isNotDrawer && $("input[name='activateMod']").is(":checked") && !$("#overlay").is(":visible") && !$(".player.guessedWord .name:contains('You')").length) {
                    if ($("input[name='activateAutocompletion']").is(":checked") || $("input[name='activateAutoTyping']").is(":checked")) {
                        let i=acWords.indexOf($("#inputChat").val());

                        if (i>=0) {
                            if (ajaxRequest!==undefined) {
                                ajaxRequest.abort();
                                searchingInWiki=false;
                            }
                            alreadyChoosenWords.push($("#inputChat").val());
                            $("#wordsList li").eq(i).remove();
                        }
                    }
                }
            }
        });

        $(document).on("keyup","input#inputChat", (e) => {
            isNotDrawer=new RegExp("_").test($("#currentWord").text());
            if (isNotDrawer && $("input[name='activateAutocompletion']").is(":checked") && !($("input[name='activateAutoTyping']").is(":checked")) && $("input[name='activateMod']").is(":checked") && !$("#overlay").is(":visible") && !$(".player.guessedWord .name:contains('You')").length) {

                if (e.keyCode!==13 && userSentence!==$("#inputChat").val()) {
                    userSentence=$("input#inputChat").val();
                    let incompleteSentence=unsafeWindow.$("#currentWord").text();
                    let checkPressedKey=/\w/g.test(String.fromCharCode(e.keyCode));

                    if (typeof words!=="undefined" && typeof words[selectedLanguage]!=="undefined" && $("#inputChat").val()!=="") {

                        let autoCompletionPattern="^";
                        let incompleteSentencePattern="^";
                        let wikiPattern="";

                        for (let i=0;i<incompleteSentence.length;i++) {
                            if (i<userSentence.length) {
                                autoCompletionPattern+=userSentence.charAt(i);
                                wikiPattern+=userSentence.charAt(i);

                                if (incompleteSentence.charAt(i)==="_") {
                                    incompleteSentencePattern+="[^ (),\.\'\-]{0,1}";
                                }
                                else {
                                    incompleteSentencePattern+=incompleteSentence.charAt(i);
                                }
                            }
                            else if (incompleteSentence.charAt(i)==="_") {
                                autoCompletionPattern+="[^ (),\.\'\-]";
                                wikiPattern+=".";
                            }
                            else {
                                autoCompletionPattern+=incompleteSentence.charAt(i);
                                wikiPattern+=incompleteSentence.charAt(i);
                            }
                        }

                        autoCompletionPattern+="$";
                        incompleteSentencePattern+="$";

                        let incompleteSentencePatternRE=new RegExp(incompleteSentencePattern);

                        if (incompleteSentencePatternRE.test(userSentence)) {
                            $("#regexError").remove();
                            let checkPattern=new RegExp(autoCompletionPattern);
                            let wordsHTML;

                            if (acWords===undefined) {
                                acWords=words[selectedLanguage].reduce((acc,result) => {
                                    (checkPattern.test(result) && alreadyChoosenWords.indexOf(result)<=-1)?acc.push(result):null;
                                    return acc;
                                },[]).sort();
                            }
                            else {
                                acWords=acWords.reduce((acc,result) => {
                                    (checkPattern.test(result) && alreadyChoosenWords.indexOf(result)<=-1)?acc.push(result):null;
                                    return acc;
                                },[]);

                                acWords=concatUniqueToArray(acWords,words[selectedLanguage].reduce((acc,result) => {
                                    (checkPattern.test(result) && alreadyChoosenWords.indexOf(result)<=-1)?acc.push(result):null;
                                    return acc;
                                },[])).sort();
                            }

                            wordsHTML=acWords.map((word) => {
                                return $(`<li><span><a>${word}</a></li></span>`);
                            });

                            $("#wikiSearch").remove();

                            if (ajaxRequest!==undefined) {
                                ajaxRequest.abort();
                                searchingInWiki=false;
                            }
                            retrieveWikiWords(wikiPattern,checkPattern,userSentence,true);

                            $("#wordsList").empty().append(wordsHTML);
                        }
                        else {
                            $("#wikiSearch").remove();
                            $("#wordsList").empty();

                            if (!$("#regexError").length) {
                                $("#skribblModBox").append("<div id='regexError'>Le mot entré ne correspond pas à celui attendu</div>");
                            }
                        }
                    }
                }
            }
        });

        $(document).on("click","#skribblModBox li a", (e) => {
            if ($("input[name='activateAutocompletion']").is(":checked")) {
                let i=acWords.indexOf($(e.target).text());
                alreadyChoosenWords.push($(e.target).text());
                $("#wordsList li").eq(i).remove();
                unsafeWindow.$("#inputChat").val($(e.target).text()).submit();
            }
            else {
                unsafeWindow.$("#inputChat").val($(e.target).text());
            }
        });

        setInterval(() => {
            if ($("#modalKicked").is(":visible")) {
                resetAI();
                clearInterval(autoGuess);
                clearInterval(gameStart);
                clearInterval(registerWords);
                gameStart=setInterval(startBOT,250);
                autoGuess=setInterval(autoGuessBOT,$("#autoGuesserFrequency").val());
                $("#skribblModBox").remove();
            }
        },1000);
    });
}