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
    .removeAttr('data-template'),
    // .remove(),

    dropdownItem: $('[data-template="nav-item-dropdown"]')
    .removeClass('d-none')
    .removeAttr('data-template'),
    // .remove()

    submenu: $('[data-template="submenu"]')
    .removeClass('d-none')
    .removeAttr('data-template'),
    // .remove()

    dropdownMenu: $('[data-template="dropdown-menu"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove(),

    dropDownItem: $('[data-template="dropdown-item"]')
    .removeClass('d-none')
    .removeAttr('data-template')
    .remove()
    
}

console.log('nav-item', templates.navTab.html());
console.log('dropdown-item', templates.dropdownItem.html());
console.log('submenu', templates.submenu.html());
console.log('dropdown-menu', templates.dropdownMenu.html());



function initDroppable(droppable){
    $(droppable).droppable({
        helper:'clone',
        greedy: true,
        // tolerance: 'touch',
        over: function(event,ui) {
            // $(this).css({borderColor: 'red'});
            let itemPlaceholder = ui.draggable
            .clone()
            .css({position:'relative', top:0, left:0, opacity:0.3})
            .addClass('placeholder-item');
    
            $(this).append(itemPlaceholder);
        },
        out: function(event,ui){
            // $(this).css({borderColor: 'black'})
            $(this).find('.placeholder-item').remove();
    
        },
        drop: function(event,ui) {
            const item = ui.draggable.css({position:'relative', top:0, left:0})
            $(this).find('.placeholder-item').remove();
            $(this).append(item);
            initNavLevels()
            // $('.draggable').each((idx,el) => $(el).removeClass('first-level second-level dropdown submenu'))
            
            // const firstLevelItems = $('.nav-items-container').find('>.draggable');
            // firstLevelItems.each((idx,el) => $(el).addClass('first-level'));
            
            // const secondLevelItems = $('.first-level').find('>.draggable');
            // secondLevelItems.each((idx,el) => {
            //     $(el).addClass('second-level');
            //     $(el).parent().addClass('dropdown')
            // });

            // if($(this).hasClass('second-level')){
            //     $(this).addClass('submenu');
            // }
    
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
        // $(el).addClass('dropdown-menu')
        $(el).parent().addClass('submenu')
    })

}

function initDraggable(draggable){
    $(draggable).draggable({
        revert: 'invalid',
        cursor: "move",
        zIndex: 1,
        opacity: .7
        // connectToSortable: $('.sortable')
    });

}

function addItem(event) {
    event.preventDefault();
    const title = $('#form-title').val();
    const url = $('#form-url').val();
    // console.log(title,url);
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
                console.log(newDropdownMenu.text());

                newDropdownNavTab.find('.nav-link')
                .addClass('dropdown-toggle')
                .attr('data-bs-toggle','dropdown')
                .text(tabTitle);

                newDropdownNavTab.append(newDropdownMenu); 

                dropdownItems.each((idx,el) => {
                    const newDropdownItem = templates.dropDownItem.clone();
                    const title = $(el).find('[type=text]').val();
                    newDropdownItem.find('>.dropdown-item').text(title);

                    function subTree(subel){
                        const newSubmenu = templates.dropdownMenu.clone().addClass('submenu');
                        console.log(subel);
                        
                        $(subel).find('>.draggable').each((idx,el) => {

                            const newSubItem = templates.dropDownItem.clone().addClass('sub-item');
                            const title = $(el).find('[type=text]').val();
                            newSubItem.find('.dropdown-item').text(title);
                            $(newSubItem).appendTo(newSubmenu);
                            // const targetItem = $('.sub-item').length > 0 ? $('.sub-item').last() : newDropdownItem;
                            // $(newSubmenu).appendTo(targetItem);
                            $(newSubmenu).appendTo(newDropdownItem);
                        })

                        $(subel).find('>.submenu').each((idx,el) => subTree(el))
                    }

                    if($(el).hasClass('submenu')){
                        subTree(el)
                    }

                    newDropdownItem.appendTo(newDropdownMenu);
                })

                newDropdownNavTab.appendTo(navContainer);

                      // function navTree(element) {
                //     const newSubmenu = templates.dropdownMenu.clone().addClass('submenu')
                //     console.log('el.submenu',$(el));
                    // const submenuItems = $(el).find('>.draggable')
                //     console.log('submenuItems',submenuItems);
                    // submenuItems.each((idx,subel) => {
                    //     navTree(subel)
                //         const newSubItem = templates.dropDownItem.clone()
                //         const title = $(subel).find('[type=text]').val();
                //         console.log(title);
                //         newSubItem.find('>.dropdown-item').text(title)
                //         newSubItem.appendTo(newSubmenu)
                //     // })
                //     $(newSubmenu).appendTo(element)
                // }

            
            }

        });
    } else {
        console.log('no');
    }
}

$('.drag-n-drop-container').on('click', deleteEditItem);
$('.form-add').on('submit', addItem);
$('#btn-gen-nav').on('click', generateNav);

// $('#btn-gen-nav').on('click', function(event){

//         const navItems = $('.nav-items-container').children();

//         const targetContainer = $('.navbar-nav');
//         targetContainer.empty();

//         function elTree(element) {
//             const subItems = $(element).children('.draggable')
//             const title = $(element).find('[type=text]').val();
//             const newDropdownItem = dropdownItemTemplate.clone();

//             if(subItems.length >0) {
//                 $(subItems).each((idx,el) => {

//                     console.log(el, $(el).parent());
//                     elTree(el);
//                 })
    
//             }   

//             newDropdownItem.find('.nav-link').text(title);
//             newDropdownItem.appendTo(targetContainer);

//         }

//         if(navItems.length>0) {
//             navItems.each((idx,el) => {
//                 if($(el).children('.draggable').length > 0){
//                     elTree(el);

//                 } else {
//                     const title = $(el).find('[type=text]').val();
//                     const newNavItem = navItemTemplate.clone();
//                     newNavItem.find('.nav-link').text(title);
//                     newNavItem.appendTo(targetContainer);
//                 }

//             })
//         } else {
//             console.log('no items');
//         }

// })
