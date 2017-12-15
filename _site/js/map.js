var zoom = d3.behavior.zoom()
  .scaleExtent([1, 10])
  .on("zoom", zoomed2());

function zoomed2(){
  d3.event.translate 

}


class Map {
    constructor() {
       this.width = 938,
       this.height = 500,
       this.gemeinden,
       this.colorscale,
       this.map_id,
       this.m_width ,
       this.svg,
       this.g,
       this.title_text,
       this.start,
       this.projection,
       this.dataset;

       //projection
      this.projection = d3.geo.conicConformal()
        .scale(150)
        .translate([this.width / 2, this.height / 1.5]);
      //path
      this.path= d3.geo.path()
         .projection(this.projection);

     $(window).resize(function() {
      var w = $(this.map_id).width();
      svg.attr("width", w);
      svg.attr("height", w * this.height / this.width);
     });
    }

    //highlight when mouseover
    highlight() {
       d3.select(this)
       .classed("highlighted", false);
    }

    //set color for value
    get_place_color(d, colorscale) {
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
               return colorscale[value]; // color = color scale
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


       d3.selectAll(this.map_id).select(".title").text(name);
       d3.selectAll(this.map_id).select(".value").text("");

   }


   zoom_start(xyz) {

       this.g.selectAll([ ".gemeinden"])
            //.style("stroke-width",(d)=>{return '1';});
            .style("stroke-width", 0.5 / xyz[2] + "px");

        this.g.transition()
          .duration(750)
          .attr("transform", "translate(" + this.projection.translate() + ")" + "scale(" + xyz[2] + ")" + "translate(-" + xyz[0] + ",-" + xyz[1] + ")")
          .selectAll([ ".gemeinden"])
          //.style("stroke-width",(d)=>{return '1';})
          .style("stroke-width", 0.5 / xyz[2] + "px")
          .selectAll(".gemeinde")
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
                /*console.log("selectValue");
                console.log(selectValue);*/
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
        .attr("class","map_svg")
        .call(zoom);


    this.svg.append("rect")
        .attr("class", "background")
        .attr("width", this.width)
        .attr("height", this.height)
        .on("mouseover", function() {
                d3.selectAll(this.map_id).select(".title").text(this.title_text);
                d3.selectAll(this.map_id).select(".value").text("");
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
    .attr("fill", function(d) {return this.get_place_color(d,this.colorscale);}.bind(this))
    .style("stroke-width", 0.001 + "px")
    .on("mouseover",function(d) { here.update_info(d,this)})
    .on("mouseout",  here.highlight)


   d3.json("data/topojson/start.json", function(error, json) {
     console.log("load start.json");
     console.log(this);

     this.start = this.get_xyz((json.features)[0]);
     console.log(this.start);
     this.zoom_start(this.start);



    }.bind(this));

  console.log("demo");
  console.log(this.start);


  function zoomed(){
            console.log();
            /*console.log("hello");
            g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            g.select("gemeinde").style("stroke-width", 1.5 / d3.event.scale + "px");*/
            console.log("zoomed");
            console.log(this.start);
            console.log(d3.event.translate );
            this.g.selectAll([ ".gemeinden"])
                  //.style("stroke-width",(d)=>{return '1';});
                  .style("stroke-width",function(d) { console.log("style"); console.log(this.start); return 0.5 / this.start[2] + "px"}.bind(this));

            var test_x=0.988*this.start[0];
            var test_y=0.982*this.start[1];

            this.g.attr("transform", "translate(" + d3.event.translate  + ")" +  "scale(" + this.start[2]*d3.event.scale +  ")" +"translate(-" + test_x + ",-" + test_y + ")" )
              .selectAll([ ".gemeinden"])
              .style("stroke-width", function(d){  console.log("style"); console.log(this.start); return 0.5 / this.start[2] + "px"}.bind(this))
              .selectAll(".gemeinde")
              .attr("d", this.path.pointRadius(20.0 / this.start[2]));

          };






    };






  map_labels(topojson_path,data_csv_path, colorscale_array, div_id, title_){
   //d3.csv(data_csv_path, function(data) {
     d3.csv(data_csv_path, function(data){
         this.dataset = data;
               d3.selectAll(div_id).select(".value").text("Load municipalities");

               // Lade Gemeinden
               d3.json(topojson_path, function(error, json) {
                     this.gemeinden = topojson.feature(json, json.objects.gemeinden).features;
                     this.title_text=title_;
                     d3.selectAll(div_id).select(".title").text(this.title_text);
                     //Starte die Demonstration
                     this.colorscale=colorscale_array;
                     this.map_id=div_id;
                     this.start_demo();
                 }.bind(this))

      }.bind(this))
 }

}

var mapLabel = new Map();
mapLabel.map_labels("data/topojson/gemeinden.topo.json","data/votes/spectral_labels.csv", d3v4.schemeSet3, "#map_spectral","Spectral Clustering ");
