/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/tree/Panel.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/panel/Map.js
 */

/**
 *
 */
Ext.define('GeoExt.ux.tree.LayerTreeBuilder', {
    extend: 'GeoExt.tree.Panel',
    requires: [
        'GeoExt.data.LayerStore',
        'GeoExt.panel.Map',
        'GeoExt.ux.tree.GroupLayerContainer'
    ],
    alias: 'widget.gx_ux_layertreebuilder',

    /** 
     * @cfg {String} Text to display the default "base layers" group (i18n).
     */
    baseLayersText: "Base layers",

    /** 
     * @cfg {String} Text to display the default "other layers" group (i18n).
     */
    otherLayersText: "Other layers",

    layerStore: null,

    wmsLegendNodes: true,

    vectorLegendNodes: true,

    initComponent: function(){
        Ext.apply(this, {
            autoScroll: true,
            lines: false,
            rootVisible: false,
            store: Ext.create('Ext.data.TreeStore', {
                  model: 'GeoExt.data.LayerTreeModel'
            })
        });

        this.layerStore.on({
            "add": this.onLayerAdded,
            scope: this
        });

        // after the layertree has been rendered, look for already added
        // layer records
        this.on({
            "afterrender": function() {
                if (this.layerStore.getCount() > 0) {
                    this.onLayerAdded(
                        this.layerStore,
                        this.layerStore.data.items
                    );
                }
            },
            scope: this
        });

        this.callParent(arguments);
    },

    onLayerAdded: function(store, records, index) {
        // first, validate all 'group' options
        Ext.each(records, function(record, index) {
            var layer = record.getLayer();

            if(layer.displayInLayerSwitcher === false) {
                if(layer.group && layer.options && layer.options.group) {
                    delete layer.group;
                    delete layer.options.group;
                }
                return;
            } else if(layer.options && layer.options.group === undefined) {
                layer.options.group = (layer.isBaseLayer)
                    ? this.baseLayersText : this.otherLayersText;
            }
        }, this);

        // then, create the nodes according to the records
        Ext.each(records, function(record, index) {
            var layer = record.getLayer(),
                group = layer.options.group.split('/'),
                groupString = layer.options.group;

            if (layer.displayInLayerSwitcher === false) {
                return;
            }

            // layers with group property set as empty string are added to
            // the root node
            if (groupString === "") {
                this.getRootNode().appendChild({
                    plugins: ['gx_layer'],
                    layer: layer,
                    text: layer.name
                });
            } else {
                this.addGroupNodes(
                    group, this.getRootNode(), groupString, record
                );
            }
        }, this);
    },

    addGroupNodes: function(groups, parentNode, groupString, layerRecord){
        var group = groups.shift(),
            childNode = this.getNodeByText(parentNode, group),
            layer = layerRecord.getLayer();

        // if the childNode doesn't exist, we need to create and append it
        if (!childNode) {
            // if that's the last element of the groups array, we need a
            // 'LayerContainer'
            if (groups.length == 0) {
                childNode = {
                    expanded: (layer && layer.visibility),
                    plugins: [{
                        enableLegend: group != this.baseLayersText &&
                                      group != this.otherLayersText,
                        layerGroup: groupString,
                        ptype: 'gx_ux_grouplayercontainer',
                        vectorLegendNodes: this.vectorLegendNodes,
                        wmsLegendNodes: this.wmsLegendNodes
                    }],
                    text: group
                };
            } else {
                // else, create and append a simple node...
                childNode = {
                    allowDrag: false,
                    expanded: (layer && layer.visibility),
                    leaf: false,
                    text: group
                };
            }

            parentNode.appendChild(childNode);

            childNode = this.getNodeByText(parentNode, group);
        }

        // if node contains any child or grand-child with a visible layer,
        // expand it
        if (layer && layer.visibility) {
            window.setTimeout(function() {
                childNode.expand();
            });
        }

        if (groups.length != 0){
            this.addGroupNodes(groups, childNode, groupString, layerRecord);
        }
    },

    getNodeByText: function(node, text){
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].data['text'] == text)
            {
                return node.childNodes[i];
            }
        }
        return false;
    }
});
