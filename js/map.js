


class Map {
    constructor() {
       this.width = 938,
       this.height = 500,
       this.gemeinden,
       this.kantone,
       this.colorscale,
       this.max_labels,
       this.map_id,
       this.m_width ,
       this.svg,
       this.g,
       this.g2,
       this.title_text,
       this.start,
       this.projection,
       this.dataset,
       this.gemeinden_json,
       this.legend_title,
       this.add_legend;

       //projection
      this.projection = d3.geo.conicConformal()
        .scale(150)
        .translate([this.width / 2, this.height / 1.5]);
      //path
      this.path= d3.geo.path()
         .projection(this.projection);
    }

    //highlight when mouseover
    highlight() {
       d3.select(this)
       .classed("highlighted", false);
    }

    //set color for value
    get_place_color(d, colorscale,max) {
       //Get data value
       if (d.munip_votes) {
                               var value = d.munip_votes;
                           }
                           else {
                               var value = 0;
                           }
       if (value ) {
               //If value exists…
               if(value == -1){

                 return '#B7E1F3';
               }
               else{
                 if(max <= 15)
                 {

                  //return colorscale[value];
                  return colorscale[value];
                 }else{
                  return colorscale(value/max);;
                 }
             }

       } else {
               //If value is undefined…

               return "#99999F";
       }
    };

   //write the value for cantons (when clicked or mouseover) and municipalities (mouseover)
  update_info(d,context) {
       if (d.munip_votes) {
           var value = d.munip_votes;
       }
       else {
           var value = 0;
       }


       d3.select(context).classed("highlighted", true);

       var name;
       if(d.properties.KTNAME) {
         name = d.properties.KTNAME;
       }
       else if(d.properties.GMDNAME) {
         name = d.properties.GMDNAME;
       }


       d3.selectAll(this.map_id).select(".value_map").text(name);


   }


   zoom_start(xyz) {

       this.g.selectAll([ ".gemeinden"])
            .style("stroke-width", 0.5 / xyz[2] + "px");

        this.g.transition()
          .duration(750)
          .attr("transform", "translate(" + this.projection.translate() + ")" + "scale(" + xyz[2] + ")" + "translate(-" + xyz[0] + ",-" + xyz[1] + ")")
          .selectAll([ ".gemeinden"])
          .style("stroke-width", 0.5 / xyz[2] + "px")
          .selectAll(".gemeinde")
          .attr("d", this.path.pointRadius(20.0 / xyz[2]));

      //for kantons
      this.g2.selectAll([ ".kantone"])
           .style("stroke-width", 0.5 / xyz[2] + "px");

       this.g2.transition()
         .duration(750)
         .attr("transform", "translate(" + this.projection.translate() + ")" + "scale(" + xyz[2] + ")" + "translate(-" + xyz[0] + ",-" + xyz[1] + ")")
         .selectAll([ ".kantone"])
         .style("stroke-width", 0.5 / xyz[2] + "px")
         .selectAll(".kanton")
         .attr("d", this.path.pointRadius(20.0 / xyz[2]));
   }

   get_xyz(d) {
        var bounds = this.path.bounds(d);
        var w_scale = (bounds[1][0] - bounds[0][0]) / this.width;
        var h_scale = (bounds[1][1] - bounds[0][1]) / this.height;
        var z = .96 / Math.max(w_scale, h_scale);
        var x = (bounds[1][0] + bounds[0][0]) / 2;
        var y = (bounds[1][1] + bounds[0][1]) / 2 + (this.height / z / 6);
        return [x, y, z];
   }

   start_demo() {
    this.gemeinden.forEach(function(d) {
                  var munip_data = this.dataset.filter( function(data) {

                      return data.Name == d.properties.GMDNAME;
                  });

              if(munip_data[0] != undefined){
              d.munip_votes = munip_data[0].Label;
            }
            else{
              d.munip_votes = -1;
            }

          }.bind(this));

    this.m_width = $(this.map_id).width();

    //SVG for map
    this.svg = d3.selectAll(this.map_id).select(".map").append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + this.width + " " + this.height)
        .attr("width", this.m_width)
        .attr("height", this.m_width * this.height / this.width)
        .attr("class","map_svg");

    this.svg.append("rect")
        .attr("class", "background")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("mouseover", function() {
                d3.selectAll(this.map_id).select(".title_map").text(this.title_text);
                d3.selectAll(this.map_id).select(".value_map").text("Mouseover a municipality to see its name");
        }.bind(this));

    //SVP group (cantons or municipalities)
     var id=this.map_id;
     var here=this;
    this.g = this.svg.append("g")
    .attr("class", "gemeinden")
    .selectAll("path")
    .data(this.gemeinden)
    .enter()
    .append("path")
    .attr("id", function(d) { return d.id; })
    .attr("class", "gemeinde")
    .attr("d", this.path)
    .attr("fill", function(d) {return this.get_place_color(d,this.colorscale, this.max_labels);}.bind(this))
    .style("stroke-width", 0.001 + "px")
    .on("mouseover",function(d) { here.update_info(d,this)})
    .on("mouseout",  here.highlight)



    this.g2 = this.svg.append("g")
    .attr("class", "kantone")
    .append("path")
    .datum(topojson.mesh(this.gemeinden_json, this.gemeinden_json.objects.gemeinden, function(a, b) { return a.properties.KTNR !== b.properties.KTNR; }.bind(this)))
    .attr("class", "kanton")
    .attr("d", this.path)
    .style("stroke-width", 0.01 + "px");



    if(this.add_legend==true){
    this.addLegend();
    this.svg.select(".legendOrdinal")

    }

   d3.json("data/topojson/start.json", function(error, json) {
     this.start = this.get_xyz((json.features)[0]);
     this.zoom_start(this.start);
    }.bind(this));
};

addLegend(){
  var colors_range = [];
  var cantons_names =[];

if(this.dataset[0].Canton_name != undefined){
  var new_object =this.dataset.map(function(d){
    return {name: d.Canton_name, index: d.Label};
  });
  new_object= _.uniqBy(new_object, "name");


  new_object.forEach(function(d){
    colors_range.push(this.colorscale(d.index/25));
  }.bind(this))
  new_object.forEach(function(d){
    cantons_names.push(d.name);
  }.bind(this))
  console.log("if");
}

else{
  cantons_names=[""," ","  ","   ","    ","     ","       ","        "]
  var label_range=[...Array(8).keys()]
  console.log(label_range);
  label_range.forEach(function(d){
    colors_range.push(this.colorscale[d]);
  }.bind(this))
  console.log("else");
}
console.log(cantons_names);
console.log(colors_range);
colors_range

var ordinal = d3.scale.ordinal()
.domain(cantons_names) //cantons names
.range(colors_range);

this.svg.append("g")
.attr("class", "legendOrdinal")
.attr("transform", "translate(20,100)");

var legendOrdinal = d3.legend.color()
.shape("path", d3.svg.symbol().type("triangle-up").size(50)())
.shapePadding(5)
.scale(ordinal)
.title(this.legend_title);

this.svg.select(".legendOrdinal")
.call(legendOrdinal);

};

map_resize(){
  $(window).resize(function() {
   var w = parseInt(d3.selectAll(this.map_id).select(".map").style("width"));
   d3.selectAll(this.map_id).select(".map").select("svg").attr("width", w);
   d3.selectAll(this.map_id).select(".map").select("svg").attr("height", w * this.height / this.width);
   d3.selectAll(this.map_id).select(".legend").select("svg").attr("width", w);
   d3.selectAll(this.map_id).select(".legend").select("svg").attr("height", w * this.height / this.width);

 }.bind(this))
}


  map_labels(gemeinden_topojson_path,data_csv_path, colorscale_array, div_id, title_, max, add_legend_, legend_title){
   //d3.csv(data_csv_path, function(data) {
      this.add_legend=add_legend_;
      this.legend_title=legend_title;
     d3.csv(data_csv_path, function(data){
         this.dataset = data;
               d3.selectAll(div_id).select(".value_map").text("Load municipalities");


                 d3.json(gemeinden_topojson_path, function(error, gemeinden_json) {
                     this.gemeinden = topojson.feature(gemeinden_json, gemeinden_json.objects.gemeinden).features;
                     this.gemeinden_json=gemeinden_json;

                     this.title_text=title_;
                     d3.select(div_id).select(".title_map").text(this.title_text);
                     d3.select(div_id).select(".value_map").text("Mouseover a municipality to see its name");

                     this.colorscale=colorscale_array;
                     this.max_labels=max;
                     this.map_id=div_id;
                     this.start_demo();
                   }.bind(this))


      }.bind(this))
 }

}

 console.log("spectral");
var mapLabel = new Map();
mapLabel.map_labels("data/topojson/gemeinden_2015.topo.json","data/votes/spec2.csv", d3v4.schemeSet3, "#map_spectral","Spectral Clustering Results",8, true,"8 Political Opinion Clusters");
mapLabel.map_resize();

console.log("none");
var mapAlgo1 = new Map();
mapAlgo1.map_labels("data/topojson/gemeinden_2015.topo.json","data/new_cantons/representativity_optimized_constrained.csv", d3v4.interpolateSpectral, "#map_algo1","Optimal Cantons with Geographical Constraints",26,true,"New cantons:");
mapAlgo1.map_resize();

var mapAlgo2 = new Map();
mapAlgo2.map_labels("data/topojson/gemeinden_2015.topo.json","data/new_cantons/representativity_optimized_unconstrained.csv", d3v4.interpolateSpectral, "#map_algo2","Optimal Cantons without constraints",26, true,"New cantons:");
mapAlgo2.map_resize();

var mapAlgo3 = new Map();
mapAlgo3.map_labels("data/topojson/gemeinden_2015.topo.json","data/new_cantons/representativity_optimized_random.csv", d3v4.interpolateSpectral, "#map_algo3","Optimal Cantons with Random Initialisation",26, true,"New cantons:");
mapAlgo3.map_resize();

var mapOrig= new Map();
mapOrig.map_labels("data/topojson/gemeinden_2015.topo.json","data/new_cantons/original_cantons.csv", d3v4.interpolateSpectral, "#map_orig","Map of cantons as of 2015",26,true,"Cantons:");
mapOrig.map_resize();
