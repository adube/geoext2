/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/tree/LayerContainer.js
 * @include GeoExt/container/WmsLegend.js
 * @include GeoExt/container/VectorLegend.js
 * @include GeoExt/data/LayerStore.js
 */

/**
 *
 */
Ext.define('GeoExt.ux.tree.GroupLayerContainer', {
    extend: 'GeoExt.tree.LayerContainer',
    requires: [
        'GeoExt.container.WmsLegend',
        'GeoExt.container.VectorLegend',
        'GeoExt.data.LayerStore'
    ],
    alias: 'plugin.gx_ux_grouplayercontainer',
    
    defaultText: 'Layers',

    enableLegend: true,

    wmsLegendNodes: true,

    vectorLegendNodes: true,

    layerGroup: null,
    
    /**
     * @private
     */
    init: function(target) {
        var me = this,
            loader = me.loader,
            createNode,
            superProto = GeoExt.tree.LayerLoader.prototype;

        // set the 'createNode' method for the loader
        if (me.enableLegend) {
            createNode = function(attr) {
                var record = this.store.getByLayer(attr.layer),
                    layer = record.getLayer();

                if (layer instanceof OpenLayers.Layer.WMS &&
                    me.wmsLegendNodes
                ) {
                    attr.component = {
                        xtype: "gx_wmslegend",
                        layerRecord: record,
                        showTitle: false,
                        hidden: !layer.visibility || layer.hideInLegend
                            || !layer.inRange,
                        cls: "gx-ux-layertreebuilder-legend"
                    };
                } else if (layer instanceof OpenLayers.Layer.Vector &&
                           me.vectorLegendNodes
                ) {
                    attr.component = {
                        xtype: "gx_vectorlegend",
                        layerRecord: record,
                        showTitle: false,
                        hidden: !layer.visibility || layer.hideInLegend
                            || !layer.inRange,
                        cls: "gx-ux-layertreebuilder-legend"
                    };
                }

                if (layer.hideInLegend) {
                    record.set("hideInLegend", layer.hideInLegend);
                }

                return superProto.createNode.call(this, attr);
            }
        }
        else {
            createNode = function(attr) {
                return superProto.createNode.call(this, attr);
            }
        } 

        // set the loader
        me.loader = Ext.applyIf(loader || {}, {
            baseAttrs: Ext.applyIf((loader && loader.baseAttrs) || {}, {
                uiProvider: "custom_ui",
                layerGroup: this.layerGroup
            }),
            createNode: createNode,
            filter: function(record) {
                var layer = record.getLayer();
                return layer.displayInLayerSwitcher === true &&
                    layer.options.group === this.baseAttrs.layerGroup;
            }
        });

        me.callParent(arguments);
    }
});
