import './node_modules/jquery/dist/jquery.min.js';
import './node_modules/jquery-ui-dist/jquery-ui.js';
import './node_modules/bootstrap/dist/js/bootstrap.bundle.js';

const templates = {
    item: $('[data-template="draggable"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove(),

    navTab: $('[data-template="nav-item"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove(),

    dropdownMenu: $('[data-template="dropdown-menu"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove(),

    dropDownItem: $('[data-template="dropdown-item"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove()
    
};

function initDroppable(droppable){
    $(droppable).droppable({
        helper:'clone',
        greedy: true,
        over: function(event,ui) {
            let itemPlaceholder = ui.draggable
            .clone()
            .css({position:'relative', top:0, left:0, opacity:0.3})
            .addClass('placeholder-item');
    
            $(this).append(itemPlaceholder);
        },
        out: function(event,ui){
            $(this).find('.placeholder-item').remove();
    
        },
        drop: function(event,ui) {
            const item = ui.draggable.css({position:'relative', top:0, left:0})
            $(this).find('.placeholder-item').remove();
            $(this).append(item);
            initNavLevels()
        }
    });
}

$('.droppable').each((idx,el) => initDroppable(el));

function initNavLevels() {
    $('.draggable').each((idx,el) => $(el).removeClass('first-level second-level dropdown submenu'))
            
    const firstLevelItems = $('.nav-items-container').find('>.draggable');
    firstLevelItems.each((idx,el) => $(el).addClass('first-level'));
    
    const secondLevelItems = $('.first-level').find('>.draggable');
    secondLevelItems.each((idx,el) => {
        $(el).addClass('second-level');
        $(el).parent().removeClass('first-level');
        $(el).parent().addClass('dropdown');
    });

    const submenus = $('.second-level').find('.draggable');
    submenus.each((idx,el) => {
        $(el).parent().addClass('submenu')
    })

}

function initDraggable(draggable){
    $(draggable).draggable({
        revert: 'invalid',
        cursor: "move",
        zIndex: 1,
        opacity: .7
    });

}

function addItem(event) {
    event.preventDefault();
    const title = $('#form-title').val();
    const url = $('#form-url').val();
    $('form').trigger('reset');

    const newItem = templates.item.clone(true)
    newItem.find('.draggable-title').val(title);
    newItem.find('.draggable-url').val(url);

    const targetContainer = $('.items-container');
    newItem.appendTo(targetContainer).hide().slideDown(300);
    initDraggable(newItem);
    initDroppable(newItem);
}

function deleteEditItem(event) {
    const target = event.target;
    const parentEl = target.closest('.draggable');
   
    if($(target).hasClass('btn-edit')) {
        const btnEdit = $(target);
        let text = btnEdit.text();

        $(parentEl).find('>input')
        .prop('disabled', function(idx,val){
            return !val;
        })

        $(btnEdit).toggleClass('btn-warning btn-success');
        $(btnEdit).text(text == 'edit' ? 'save' : 'edit');
    }

    if($(target).hasClass('btn-remove')) {
        $(target).closest('.draggable').slideUp(300,function(){
            parentEl.remove();
            initNavLevels();
        })
    }
}

function generateNav() {
    const navItems = $('.nav-items-container').children();
    const navContainer = $('.navbar-nav');
    navContainer.empty();

    if(navItems.length > 0) {
        if($('nav').hasClass('d-none')){
            $('nav').removeClass('d-none').hide().slideDown(300);
        }
        if(!$('.no-items-msg').hasClass('d-none')){
            $('.no-items-msg').addClass('d-none').slideUp(300);
        }
        
        navItems.each((idx,el) => {
            const tabTitle = $(el).find('[type=text]').val();
            const newNavTab = templates.navTab.clone();
            newNavTab.find('>.nav-link').text(tabTitle);

            if($(el).hasClass('first-level')){
                newNavTab.appendTo(navContainer);

            } else if ($(el).hasClass('dropdown')){
                const newDropdownNavTab = newNavTab.addClass('dropdown');
                const newDropdownMenu = templates.dropdownMenu.clone();
                const dropdownItems = $(el).find('>.draggable');

                newDropdownNavTab.find('.nav-link')
                .addClass('dropdown-toggle')
                .attr('data-bs-toggle','dropdown')
                .text(tabTitle);

                newDropdownNavTab.append(newDropdownMenu); 

                dropdownItems.each((idx,el) => {
                    const newDropdownItem = templates.dropDownItem.clone();
                    const title = $(el).find('[type=text]').val();
                    newDropdownItem.find('>.dropdown-item').text(title);

                    function subTree(subel, dropdownToAppend){
                        dropdownToAppend.addClass('arrow');
                        const newSubmenu = templates.dropdownMenu.clone().addClass('submenu');
                        $(subel).find('>.draggable').each((idx,el) => {
                            const newSubItem = templates.dropDownItem.clone();
                            const title = $(el).find('[type=text]').val();
                            newSubItem.find('.dropdown-item').text(title);

                            if ($(el).find('>.draggable').length > 0) {
                                subTree(el, newSubItem)
                            }

                            $(newSubItem).appendTo(newSubmenu);                            
                        })

                        $(newSubmenu).appendTo(dropdownToAppend);
                    }

                    if($(el).hasClass('submenu')){
                        subTree(el, newDropdownItem)
                    }

                    newDropdownItem.appendTo(newDropdownMenu);
                })

                newDropdownNavTab.appendTo(navContainer);
            
            }

        });
    } else {
        $('nav').slideUp(300, function(){
            $(this).addClass('d-none')
            $('.no-items-msg').removeClass('d-none').hide().slideDown(100)
        })
        
    }
}


$('.drag-n-drop-container').on('click', deleteEditItem);
$('.form-add').on('submit', addItem);
$('#btn-gen-nav').on('click', generateNav);

