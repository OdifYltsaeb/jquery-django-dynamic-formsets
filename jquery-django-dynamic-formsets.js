$.fn.djangodynamicformset = function( options ){
    
    var defaults = {
        'addLink' : "a.add",        // Expects selector in a form of string
        'item' : 'tr',              // Expects selector in a form of string
        'keepFieldValues' : false,  // Expects boolean or Array
        'minForms' : 0,             // Expects int
        'onRemove' : null,          // Expects function
        'onAdd' : null,             // Expects function
        'onAfterInit' : null,       // Expects function
        'prefix' : "form",          // Expects string
        'removeLink' : "a.remove"   // Expects selector in a form of string
    }

    var settings = $.extend( { 'defaultRow' : null, 'nextElement' : null }, defaults, options );

    /* Thank you https://djangosnippets.org/snippets/1389/ */
    var updateElementIndex = function(parent) {
            var id_regex = new RegExp('(' + settings.prefix + '-\\d+)');

            var forms = parent.find( settings.item );

            for ( var i = 0, formCount = forms.length; i < formCount; i++){
                var children = $(forms[i]).find('label,input,select,textarea');
                var replacement = settings.prefix + '-' + i;
                for ( var j = 0; j < children.length; j++){
                    var el = children[j];
                    if ($(el).attr("for")) $(el).attr("for", $(el).attr("for").replace(id_regex, replacement));
                    if (el.id) el.id = el.id.replace(id_regex, replacement);
                    if (el.name) el.name = el.name.replace(id_regex, replacement);
                }
            }
            $('#id_' + settings.prefix + '-TOTAL_FORMS').val(forms.length);
            var forms = null;
        },
        
        addForm = function(parent){
            var row = $(settings.defaultRow).clone(true).get(0);

            if ( typeof row == 'undefined' ){
                var row = settings.defaultRow;
                $(row).removeAttr( 'id' ).insertBefore( $( settings.nextElement ) ).children('.hidden').removeClass('hidden');
            } else {
                $(row).removeAttr( 'id' ).insertAfter( $( settings.item + ':last' ) ).children('.hidden').removeClass('hidden');                
            }

            $(row).find('input,select,textarea').each(function() {
                var $el = $(this);
                if ( settings.keepFieldValues === false ){
                    $el.val('');
                } else if (settings.keepFieldValues instanceof Array) {
                    for ( var i = 0; i < settings.keepFieldValues.length; i++){
                        var prev_row = $(row).prev().get(0);
                        var reg_str = '(' + settings.prefix + '-\\d+' + '-' + settings.keepFieldValues[i]+ ')';
                        var name_regex = new RegExp(reg_str);
                        if ( $el.attr('name').match(name_regex) ) {
                            var similarElements = $(prev_row).find( this.nodeName.toLowerCase() );
                            for ( var j = 0; similarElements.length; j++ ){
                                var elName = $(similarElements[j]).attr('name');
                                if ( elName && elName.match( name_regex ) ){
                                    $el.val( similarElements[j].value );
                                    break;
                                }
                            }
                        } else {
                            $el.val('');
                        }
                    }
                }
            });

            updateElementIndex(parent);

            $(row).find( settings.removeLink ).click(function() {
                event.preventDefault();
                deleteForm(event.target, parent);
            });
            if ( typeof settings.onAdd == 'function'){
                settings.onAdd(row);
            }
            row = null;
            return false;
        },

        deleteForm = function(el, parent){
            var row = $( el ).parents( settings.item ).get(0);

            if ( parent.find( settings.item ).length == settings.minForms){
                return false;
            } else {
                if ( typeof settings.onRemove == 'function'){
                    settings.onRemove(row);
                }
                row.remove();
                row = null;
                updateElementIndex( parent );
                return false;
            }
        }

    return this.each(function(){
        var $jqel = $(this);
        /* 
            our initial setup
        */
        settings.defaultRow = $jqel.find( settings.item + ':first' ).clone(true).get(0);
        settings.nextElement = $jqel.find( settings.item + ':last' ).next().get(0);
        
        $jqel.find(settings.addLink).bind({
            'click': function(event){
                event.preventDefault();
                addForm($jqel);
            }
        });
        
        $jqel.find(settings.removeLink).bind({
            'click': function(event){
                event.preventDefault();
                var el = event.target;
                deleteForm(el, $jqel);
            }
        });

        if ( typeof settings.onAfterInit == 'function'){
            settings.onAfterInit();
        }

        return ;
    });
}
