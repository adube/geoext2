Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.panel.Map',
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.tree.View',
    'GeoExt.container.WmsLegend',
    'GeoExt.container.VectorLegend',
    'GeoExt.tree.Column',
    'GeoExt.panel.Legend'
]);

var mapPanel, legendPanel, tree;

Ext.application({
    name: 'Tree Legend',
    launch: function() {
        var host = "http://dev4g.mapgears.com",
            url = host + "/cgi-bin/mswms_gmap?";

        // create a vector layer to demonstrate the vector legend
        var mercator = new OpenLayers.Projection('EPSG:900913');
        var lonlat = new OpenLayers.Projection('EPSG:4326');

        var features = new Array(50);
        for (var i=0; i<features.length; i++) {
            features[i] = new OpenLayers.Feature.Vector(
                new OpenLayers.Geometry.Point(
                    (20 * Math.random()) - 80, 20 * Math.random() + 40
                ).transform(lonlat, mercator)
            );
        }
        var rules = [
            new OpenLayers.Rule({
                title: "Blue stars",
                symbolizer: {
                    graphicName: "star",
                    pointRadius: 8,
                    fillColor: "#99ccff",
                    strokeColor: "#666666",
                    strokeWidth: 1
                }
            })
        ];
        var vector = new OpenLayers.Layer.Vector(
            'Vector - Random points',
            {
                styleMap: new OpenLayers.StyleMap(
                    new OpenLayers.Style({}, {rules: rules})
                ),
                visibility: true,
                group: "Vector"
            }
        );
        vector.addFeatures(features);

        // second vector layer
        var vector2 = new OpenLayers.Layer.Vector('Vector - Single Polygon', {
            styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style({
                    pointRadius: 8,
                    fillColor: "#00ffee",
                    strokeColor: "#000000",
                    strokeWidth: 2
                })
            })
        });
        vector2.addFeatures([
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.fromWKT(
                    "POLYGON(-10000000 3000000, -10000000 4000000, -9000000 4000000, -10000000 3000000)"
                )
            )
        ]);

        mapPanel = new GeoExt.MapPanel({
            region: "center",
            map: {
                allOverlays: false,
                maxExtent: new OpenLayers.Bounds(
                    -20037508.34,-20037508.34,20037508.34,20037508.34
                ),
                maxResolution: 156543.0339,
                projection: new OpenLayers.Projection("EPSG:900913"),
                units: "m"
            },
            center: [-11124334, 6843905],
            zoom: 3,
            layers: [
                new OpenLayers.Layer.TMS(
                    "TMS - OSM", 
                    [
                        "http://osm-t1.mapgears.com/mapcache/tms/",
                        "http://osm-t2.mapgears.com/mapcache/tms/",
                        "http://osm-t3.mapgears.com/mapcache/tms/",
                        "http://osm-t4.mapgears.com/mapcache/tms/"
                    ],
                    {
                        layername: 'osm@g',
                        type: "png",
                        displayInLayerSwitcher: false
                    }
                ),
                new OpenLayers.Layer.WMS(
                    "WMS - Parks",
                    url,
                    {
                        layers: "park",
                        format: 'image/png'
                    },
                    {
                        hideInLegend: true,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: true
                    }
                ),
                new OpenLayers.Layer.WMS(
                    "WMS - Roads",
                    url,
                    {
                        layers: "road",
                        format: 'image/png'
                    },
                    {
                        hideInLegend: false,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: true
                    }
                ),
                vector,
                vector2
            ]
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                plugins: [{
                    ptype: "gx_layercontainer",
                    loader: {
                        createNode: function(attr) {
                            if (attr.layer instanceof OpenLayers.Layer.WMS) {
                                // add a WMS legend to each node created
                                attr.component = {
                                    xtype: "gx_wmslegend",
                                    layerRecord: mapPanel.layers.getByLayer(attr.layer),
                                    showTitle: false,
                                    // custom class for css positioning
                                    // see tree-legend.html
                                    cls: "legend"
                                };
                            } else if (attr.layer instanceof OpenLayers.Layer.Vector) {
                                attr.component = {
                                    xtype: "gx_vectorlegend",
                                    layerRecord: mapPanel.layers.getByLayer(attr.layer),
                                    showTitle: false//,
                                    // custom class for css positioning
                                    // see tree-legend.html
                                    //cls: "legend"
                                };
                            }
                            return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
                        }
                    }
                }]
            }
        });

        tree = new GeoExt.tree.Panel({
            region: "east",
            title: "GeoExt.tree.Panel",
            width: 200,
            autoScroll: true,
            viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: false
                }]
            },
            store: store,
            rootVisible: false,
            lines: false
        });

        legendPanel = Ext.create('GeoExt.panel.Legend', {
            title: "GeoExt.panel.Legend",
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px'
            },
            bodyStyle: 'padding:5px',
            width: 200,
            autoScroll: true,
            region: 'west'
        });

        new Ext.Viewport({
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                items: [
                    mapPanel, legendPanel, tree, {
                        contentEl: desc,
                        region: "south",
                        width: 200,
                        bodyStyle: {padding: "5px"}
                    }
                ]
            }
        });
    }
});
