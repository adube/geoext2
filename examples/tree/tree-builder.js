/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.panel.Map',
    'GeoExt.tree.View',
    'GeoExt.tree.Column',
    'GeoExt.tree.LayerTreeBuilder'
]);

var mapPanel, tree;

Ext.application({
    name: 'Tree',
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
            'Random vector points',
            {
                styleMap: new OpenLayers.StyleMap(
                    new OpenLayers.Style({}, {rules: rules})
                ),
                visibility: true,
                group: "Vector"
            }
        );
        vector.addFeatures(features);

        // create a map panel with some layers with 'group' property sets that
        // will be automatically added show in our layer tree builder below.
        mapPanel = Ext.create('GeoExt.panel.Map', {
            border: true,
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
                // group: undefined
                new OpenLayers.Layer.TMS(
                    "OSM - TMS", 
                    [
                        "http://osm-t1.mapgears.com/mapcache/tms/",
                        "http://osm-t2.mapgears.com/mapcache/tms/",
                        "http://osm-t3.mapgears.com/mapcache/tms/",
                        "http://osm-t4.mapgears.com/mapcache/tms/"
                    ],
                    {
                        layername: 'osm@g',
                        type: "png"
                    }
                ),
                // group: GMap/Polygons
                new OpenLayers.Layer.WMS(
                    "Parks (hideInLegend: true)",
                    url,
                    {
                        layers: "park",
                        format: 'image/png'
                    },
                    {
                        group: "GMap/Polygons",
                        hideInLegend: true,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: true
                    }
                ),
                // group: GMap/Lines
                new OpenLayers.Layer.WMS(
                    "Railroads (visibility: false)",
                    url,
                    {
                        layers: "rail",
                        format: 'image/png'
                    },
                    {
                        group: "GMap/Lines",
                        hideInLegend: false,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: false
                    }
                ),
                new OpenLayers.Layer.WMS(
                    "Roads (visibility: true)",
                    url,
                    {
                        layers: "road",
                        format: 'image/png'
                    },
                    {
                        group: "GMap/Lines",
                        hideInLegend: false,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: true
                    }
                ),
                // group: Vector
                vector,
                // no group
                new OpenLayers.Layer.WMS(
                    "Grid (No 'group' property)",
                    url,
                    {
                        layers: "grid",
                        format: 'image/png'
                    },
                    {
                        hideInLegend: false,
                        isBaseLayer: false,
                        singleTile: true,
                        visibility: false
                    }
                )
            ]
        });

        // layers added using button
        var layerWGroup = new OpenLayers.Layer.WMS(
            "Cities (added using button)",
            url,
            {
                layers: "popplace",
                format: 'image/png'
            },
            {
                group: "GMap/Points",
                hideInLegend: false,
                isBaseLayer: false,
                singleTile: true,
                visibility: true
            }
        );

        var layerBGroup = new OpenLayers.Layer.WMS(
            "Dummy (blank group)",
            url,
            {
                layers: "dummy_poly",
                format: 'image/png'
            },
            {
                group: "",
                hideInLegend: false,
                isBaseLayer: false,
                singleTile: true,
                visibility: true
            }
        );

        tree = Ext.create('GeoExt.tree.LayerTreeBuilder', {
            border: true,
            layerStore: mapPanel.layers,
            region: "west",
            width: 250,
            tbar: [{
                text: "add(with group)",
                tooltip: layerWGroup.options.group + " - " + layerWGroup.name,
                handler: function() {
                    mapPanel.map.addLayer(layerWGroup);
                }
            },{
                text: "add(blank group)",
                tooltip: "'' - " + layerBGroup.name,
                handler: function() {
                    mapPanel.map.addLayer(layerBGroup);
                }
            }]
        });
    
        Ext.create('Ext.Viewport', {
            border: false,
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                deferredRender: false,
                items: [mapPanel, tree, {
                    contentEl: "desc",
                    region: "south",
                    bodyStyle: {"padding": "5px"},
                    collapsible: true,
                    collapseMode: "mini",
                    split: true,
                    height: 200,
                    title: "Description"
                }]
            }
        });
    }
});
