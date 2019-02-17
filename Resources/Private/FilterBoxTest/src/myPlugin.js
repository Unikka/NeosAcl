import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import { upcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import View from '@ckeditor/ckeditor5-ui/src/view';

import Model from '@ckeditor/ckeditor5-ui/src/model';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';


class SampleInputView extends View {
    constructor(locale) {
        super(locale);

        // An entry point to binding observables with DOM attributes,
        // events and text nodes.
        const bind = this.bindTemplate;

        // Views define their interface (state) using observable properties.
        this.set({
            isEnabled: false,
            placeholder: ''
        });


        // The default dropdown.
        const dropdownView = createDropdown(locale);

        // The collection of the list items.
        const items = new Collection();

        items.add({
            type: 'button',
            model: new Model({
                withText: true,
                label: 'Foo',
                myId: "Internal-iD2"
            })
        });

        items.add({
            type: 'button',
            model: new Model({
                withText: true,
                label: 'Bar',
                myId: "Internal-iD"
            })
        });

        // Create a dropdown with a list inside the panel.
        addListToDropdown(dropdownView, items);

        dropdownView.on('execute', (event) => {
            console.log("CALL", event, event.source.label,  event.source.myId);
            console.log("XX", dropdownView.buttonView);

            dropdownView.buttonView.label = event.source.label;
        });

        dropdownView.buttonView.withText = true;
        dropdownView.buttonView.label = "Hallo42";

        this.setTemplate({
            tag: 'div',
            children: [
                dropdownView
            ],
            attributes: {
                class: [
                    'foo',
                    // The value of view#isEnabled will control the presence
                    // of the class.
                    bind.if('isEnabled', 'ck-enabled'),
                ],

                // The HTML "placeholder" attribute is also controlled by the observable.
                placeholder: bind.to('placeholder'),
                type: 'text'
            },
            on: {
                // DOM keydown events will fire the view#input event.
                keydown: bind.to('input')
            }
        });
    }

    setValue(newValue) {
        this.element.value = newValue;
    }
}



export default class MyPlugin extends Plugin {
    static get requires() {
        return [Widget];
    }
    init() {
        console.log("this.editor", this.editor);

        /*this.editor.editing.downcastDispatcher.on('insert', ( evt, data, conversionApi ) => {
            console.log("INSERT", evt, data, conversionApi);
        });*/
        console.log('InsertImage was initialized');

        const model = this.editor.model;

        model.schema.register('widget', {
            inheritAllFrom: '$block',
            isObject: true
        });

        model.schema.extend('$text', {
            allowIn: 'nested'
        });

        model.schema.register('nested', {
            allowIn: 'widget',
            isLimit: true
        });

        this.editor.conversion.for('dataDowncast')
            .add(downcastElementToElement({
                model: 'widget',
                view: (modelItem, writer) => {
                    return writer.createContainerElement('div', { class: 'widget' });
                }
            }))
            .add(downcastElementToElement({
                model: 'nested',
                view: (modelItem, writer) => {
                    return writer.createContainerElement('div', { class: 'nested' });
                }
            }));

        this.editor.conversion.for('editingDowncast')
            .add(downcastElementToElement({
                model: 'widget',
                view: (modelItem, writer) => {
                    const div = writer.createContainerElement('div', { class: 'widget' });
                    const x2 = writer.createUIElement('div', null, function (domDocument) {
                        const domElement = this.toDomElement(domDocument);

                        // HINT: we are rendering a view here inside a Widget :)
                        const view = new SampleInputView();
                        view.render();

                        domElement.appendChild(view.element);
                        view.isEnabled = true;

                        // TODO: For some reason, it is not possible to interact with the view.

                        return domElement;
                    });

                    // TODO: Somehow, the <nested> model element is always inserted BEFORE the "x2" UI element. How can ensure that <nested> is rendered AFTER "x2"?
                    writer.insert(writer.createPositionAt(div, 0), x2);

                    return toWidget(div, writer, { label: 'widget label' });
                }
            }))
            .add(downcastElementToElement({
                model: 'nested',
                view: (modelItem, writer) => {
                    // const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
                    const nested = writer.createEditableElement('div', { class: 'nested' });

                    return toWidgetEditable(nested, writer);
                }
            }));

        this.editor.editing.mapper.on('modelToViewPosition', (evt, data) => {
            if (data.modelPosition.parent.name === 'nested') {
                console.log("XXXXXXXXXY");
                const viewX = this.editor.editing.mapper.toViewElement(data.modelPosition.parent);
                data.viewPosition = new ViewPosition( viewX, 1 );
                evt.stop();
            }
        })

        /*mapper.on( 'modelToViewPosition', ( evt, data ) => {
        *			const positionParent = modelPosition.parent;
        *
        *			if ( positionParent.name == 'captionedImage' ) {
            *				const viewImg = data.mapper.toViewElement( positionParent );
            *				const viewCaption = viewImg.nextSibling; // The <span> element.
            *
            *				data.viewPosition = new ViewPosition( viewCaption, modelPosition.offset );
            *
            *				// Stop the event if other callbacks should not modify calculated value.
            *				evt.stop();
            *			}
        *		} );
*/
        this.editor.conversion.for('upcast')
            .add(upcastElementToElement({
                view: {
                    name: 'div',
                    class: 'widget'
                },
                model: 'widget'
            }))
            .add(upcastElementToElement({
                view: {
                    name: 'div',
                    class: 'nested'
                },
                model: 'nested'
            }));

        ;
    }
}
