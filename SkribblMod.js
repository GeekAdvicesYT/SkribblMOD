// ==UserScript==
// @name         SkribblMOD
// @version      0.1
// @description  Enjoy the hack power !
// @author       GeekAdviceYT
// @match        https://skribbl.io
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_addStyle
// ==/UserScript==

let $=window.jQuery;

GM_addStyle(
        `.skribblModOptions, .optionContainer {
           display: flex;
           align-items: center;
         }
         .optionContainer span {
           font-size: large;
           margin: 10px;
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
         body {
           background: url(http://vvzhishaji.com/wp-content/uploads/2018/08/Dark-Background.png);
         }`);

$(document).ready(function() {
    let beginOptions={
        activateSkribblMod: "",
        hiddenSkin: ""
    };

    let options=(JSON.parse(localStorage.getItem("skribblModOptions"))!==null)?JSON.parse(localStorage.getItem("skribblModOptions")):beginOptions;

    $(".loginPanelContent").first().append(
    `<div id="skribblModOptions">
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
                $(".avatarContainer").addClass("hideObject");
                localStorage.setItem("avatar","[-1,-1,-1,-1]");
            }
            else {
                options.hiddenSkin="";
                $(".avatarContainer").removeClass("hideObject");
                localStorage.setItem("avatar","[2,2,2,-1]");
            }
            localStorage.setItem("skribblModOptions",JSON.stringify(options));
        }
        location.reload();
    });
});
