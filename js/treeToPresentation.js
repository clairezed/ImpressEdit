/* 
 *outils pour l'init de la présentation depuis une liste à puce ordonnée stockée dans layout.html
 *
 *                  ATTENTION   pour le moment c'est guetto de stocker la lise à puce dans le layout.html, mais ca changera bientot !
 */


deltaZ = 1000;

function goCK() {
//    $('#slideArea').html('');
//    var editor_data = CKEDITOR.instances.editor1.getData();
//    $('#tree').html(editor_data);

    $('#tree li').each(function() {
        //var span = "<span class='li' contenteditable='true'> texte </span>";
        var span = "<span class='li' contenteditable='true'> " + $(this).html().match(/.*/)[0] + " </span>";
        //$(this).html('');
        $(this).prepend(span);

    });


}


function max(array) {
    var m = 0;
    for (var val in array) {
        if (array[val] >= m) {
            m = array[val];
        }
        ;

    }
    return m;
}

sibPerLevel = new Array();
function goDepth() {



    //stocke le nombre de siblings par niveau de profondeur (independament des parents)
    //ex : si on a sibPerLevel[2] = 4 cela signifie qu'en tout il y a 4 sous titre de niveau 2 (mais il est possible que que chacun de ces sous titres soient dans une partie mère différente



    //determintation des niveaux de profondeur et nombre de siblings de chaque partie/sous partie
    $('#tree li').each(function() {
        //compteur de niveau
        var depth = $($(this), "#tree").parents('ol').length;

        //compteur d'element par niveau
        var siblings = $(this).parent().children('li').length;

        //compteur d'enfant li
        var nbChild = $(this).children('ol').children('li').length;

        if (sibPerLevel[depth] === undefined) {
            sibPerLevel.push(0);
        } else {
            sibPerLevel[depth] = sibPerLevel[depth] + siblings;
        }

        //$(this).children('span').html('nb enfant ' + nbChild);
        $(this).attr('depth', depth).attr('siblings', siblings).attr('nbChild', nbChild);
    });



    //////calcul des positions 
    $('#tree').attr('number', '');
    $('#tree').prepend("<span style='display:none'>Jmpress Editor -</span>");
    //premiers niveaux
    $('#tree li').each(function() {

        if ($(this).attr('depth') === '1') {

            var delta = 1000;
            var x = 2000 * $(this).index();
            var y = 500 * $(this).index();
            var z = 5000;


            $(this).attr('data-x', x).attr('data-y', y).attr('data-z', z).attr('data-rotate-x', '-45');
            $(this).attr('type', 'title1');
            var indice = parseFloat($(this).index()) + 1;
            $(this).attr('number', indice);
            //$(this).children('span').html('x ' + x + ' y ' + y + ' z ' + z);
        }


    });

    //les autres niveaux
    $('#tree li').each(function() {
        if ($(this).attr('depth') !== '1' && $(this).attr('nbChild') !== '0') {
            var delta = 1000;
            var x = $(this).parent().parent().attr('data-x'); //pour atteindre la li qui la stocke
            var z = $(this).parent().parent().attr('data-z') - deltaZ;
            if ($(this).index() === 0) {
                var y = parseFloat($(this).parent().parent().attr('data-y')) + delta; //pour atteindre la li qui la stocke                      

            } else {                                                                    //compensation de deplacement en fn du nb d'enfant non mit verticalement ! il faut le prendre en compte 

                var y = parseFloat($(this).parent().parent().attr('data-y')) + delta * ($(this).index() + 1);
                if ($($(this).prev('li').children('ol').children('li')[0]).attr('nbChild') !== '0') { //si le precedent siblings a des enfants qui ont des enfants, ces enfants (au sibling) ne sont pas du contenu, il faut donc leur laisser la place de se mettre en y 
                    y += delta * 1.5 * $(this).prev('li').attr('nbChild');
                }
            }
            $(this).attr('data-x', x).attr('data-y', y).attr('data-z', z);
            $(this).attr('type', 'title1');
            var indice = parseInt($(this).index()) + 1;
            $(this).attr('number', $(this).parent().parent().attr('number') + "." + indice);


        } else if ($(this).attr('depth') !== '1' && $(this).attr('nbChild') === '0') {       //si pas d'enfants, c'est du contenu, slides verticales                        

            var x = $(this).parent().parent().attr('data-x'); //pour atteindre la li qui la stocke
            var y = $(this).parent().parent().attr('data-y');
            var z = parseFloat($(this).parent().parent().attr('data-z')) - ($(this).index() + 1) * 1500;
            $(this).attr('data-x', x).attr('data-y', y).attr('data-z', z);
            $(this).attr('type', 'content');
            var indice = parseFloat($(this).index()) + 1;
            $(this).attr('number', $(this).parent().parent().attr('number') + "." + indice);

        }

    });


}



function goJmpress() {

    //slide permettant d'init la position de la zone de vue 
    var overview = "<div class='step overview' data-x = '1000' data-y =' 1000 ' data-z =' 0 ' data-scale='10'></div>";
    $('#slideArea').children().append(overview);
    var $newSlide = $('#slideArea>').children().last(); // contenu (enfant div step element)                
    $('#slideArea').jmpress('init', $newSlide);

    j = 0;  //pas très algorythmique cela

    //////////////////////créer les overview dans le json
    var id = 0;
    var Ox = 4300;//sibPerLevel[1] * 2000 / 2;
    var Oy = 1000;//max(sibPerLevel) * 1000 / 2;
    var Oz = 2700;
    var scale = 9.5;

    //creation des overwiews de départ
    var evCodeSlide = ({
        type: 'code',
        x: 2000,
        y: 2000,
        z: 3000,
        rotateX: 0,
        rotateY: 320,
        rotateZ: 0,
        id: "slide-" + id++,
        typeEl: 'overview',
        index: id,
        scale: scale
    });
    createSlide('overview', evCodeSlide);

    var evCodeSlide = ({
        type: 'code',
        rotateX: -45,
        rotateY: 0,
        rotateZ: 0,
        x: Ox,
        y: Oy,
        z: Oz,
        id: "slide-" + id++,
        typeEl: 'overview',
        index: id,
        scale: scale
    });
    createSlide('overview', evCodeSlide);




    //creation des slides jmpress
    $('#tree li').each(function() {

        var evCodeSlide = ({
            type: 'code',
            rotateX: $(this).attr('data-rotate-x'),
            rotateY: 0,
            rotateZ: 0,
            x: $(this).attr('data-x'),
            y: $(this).attr('data-y'),
            z: $(this).attr('data-z'),
            id: "slide-" + id++,
            typeEl: 'slide title',
            index: id,
            scale: 1
        });

        createSlide('slide', evCodeSlide);

        var $newSlide = $('#slideArea>').children().last(); // contenu (enfant div step element)

        var string = $(this).parent().parent().children('span').html();
        var reg = new RegExp("[@]+", "g");


        //surtitre tronqué par à partir de @
        var tabTxt = string.split(reg);
        var evCodeText = ({
            type: 'code',
            container: $newSlide,
            x: '0',
            y: '0',
            z: '0',
            content: $(this).parent().parent().attr('number') + " - " + tabTxt[0]
        });
        createText('title2', evCodeText);



        //contenu (titre ou content)
        string = $(this).children('span').html();
        tabTxt = string.split(reg);

        var evCodeText = ({
            type: 'code',
            container: $newSlide,
            x: '0',
            y: '999',
            z: '0',
            content: $(this).attr('number') //KIKI+ " - " + content
        });

        if ($(this).attr('type') === 'content') {
            //var content = "<p>" + tabTxt.join('</p> <p>') + "</p>";
            var content = tabTxt.join('');
            evCodeText.y = 100;        //KIKI magouille pour décaler les textes de contenus


            for (var val in tabTxt) {   //crée une nouvelle instance de bodyText pour la mise à la ligne
                evCodeText.content = tabTxt[val];
                createText('bodyText', evCodeText);

            }

        } else {        //sinon c'est un titre
            evCodeText.content += tabTxt.join('');
            evCodeText.y = 0;
            if ($(this).attr('type') === 'title1') {
                createText('title1', evCodeText);
            } else if ($(this).attr('type') === 'title2') {
                createText('title2', evCodeText);
            }

        }

    });


    goAutoAlign();  //-> le probleme sur lequel je buttais depuis une demie heure
    //c'était que cet appel de fonction n'es pas bon, il manque  ()  !!


}


function goAutoAlign() {

    //$('#slideArea .slide').each(function() {
    $('#slideArea .slide').each(function() {
        var sizeMax = parseInt($(this).height());

        var totHeight = 0;
        $(this).children('.element').each(function() {
            totHeight += parseInt($(this).height());

            if ($(this).children()[0].className === 'bodyText') {
                totHeight = -10000;
            }

        });

        //compensation pour les trop gros
        if (totHeight > sizeMax) {     //si depassement de la slide
            $($(this).children()[0]).children().css('padding-bottom', 60).css('font-size', '3em');     //reduction de l'espace titreslide/contenu
            $($(this).children()[1]).children().css('font-size', '5em');
            totHeight = 0;
            $(this).children('.element').each(function() {
                totHeight += parseInt($(this).height());

            });
            //console.log(totHeight);

            if (totHeight > sizeMax) {     //si encore depassement de la slide
                $($(this).children()[0]).children().css('padding-bottom', 10).css('font-size', '2em');     //reduction de l'espace titreslide/contenu
                $($(this).children()[1]).children().css('font-size', '4em');


                var totHeight = 0;
                $(this).children('.element').each(function() {
                    totHeight += parseInt($(this).height());

                });

            }
        }

        //positionnement à proprement dit
        $($(this).children('.element')).each(function() {

            //console.log("totpourtous " + totHeight);


            if (totHeight > 0) {        //permet d'exclure les slides de content
                var height = parseInt($(this).height());
                var midAllText = sizeMax / 2 - totHeight / 2;
                var top = midAllText + height / 2;
                var top = (sizeMax - totHeight) / 2;
                //console.log(totHeight + " " + height + " " + midAllText + " " + top);

                $(this).css('top', top);

            }
        });
    });

    $('#slideArea').jmpress('deinit');
    $('#slideArea').jmpress();

}


function initPress() {
    goCK();
    goDepth();
    goJmpress();
}