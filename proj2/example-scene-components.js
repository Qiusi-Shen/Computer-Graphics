// UCLA's Graphics Example Code (Javascript and C++ translations available), by Garett for CS174a.
// example-scene-components.js - The Scene_Component subclasses defined here describe different independent animation processes that you 
// want to fire off each frame, by defining a display event and how to react to key and mouse input events.  Create your own subclasses, 
// and fill them in with all your shape drawing calls and any extra key / mouse controls.

  // **********************************************************************************
  // First go down to the following class's display() method to see where the sample 
  // shapes you see drawn are coded, and a good place to begin filling in your own code.

Declare_Any_Class( "Example_Animation",  // An example of a Scene_Component that our class Canvas_Manager can manage.  This one draws the scene's 3D shapes.
  { 'construct'( context )
      { var shapes = { 'triangle'        : new Triangle(),                               // At the beginning of our program, instantiate all shapes we plan to use,
                       'strip'           : new Square(),                                // each with only one instance in the graphics card's memory.
                       'bad_tetrahedron' : new Tetrahedron( false ),                   // For example we would only create one "cube" blueprint in the GPU, but then 
                       'tetrahedron'     : new Tetrahedron( true ),                   // re-use it many times per call to display to get multiple cubes in the scene.
                       'windmill'        : new Windmill( 10 ) };
        this.submit_shapes( context, shapes );
        // *** Materials: *** Declare new ones as temps when needed; they're just cheap wrappers for some numbers.  1st parameter:  Color (4 floats in RGBA format),
        // 2nd: Ambient light, 3rd: Diffuse reflectivity, 4th: Specular reflectivity, 5th: Smoothness exponent, 6th: Optional texture object, leave off for un-textured.
        this.define_data_members( { purplePlastic: context.shaders_in_use["Phong_Model" ].material( Color( .9,.5,.9, 1 ), .4, .4, .8, 40 ),
                                    greyPlastic  : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5,.5, 1 ), .4, .8, .4, 20 ),   // Smaller exponent means 
                                    blueGlass    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, 1,.2 ), .4, .8, .4, 40 ),     // a bigger shiny spot.
                                    fire         : context.shaders_in_use["Funny_Shader"].material() } ); 
      },
    'display'( graphics_state )
      { var model_transform = identity();             // We have to reset model_transform every frame.
        
        // *** Lights: *** Values of vector or point lights over time.  Two different lights *per shape* supported; more requires changing a number in the vertex shader.
        graphics_state.lights = [ new Light( vec4(  30,  30,  34, 1 ), Color( 0, .4, 0, 1 ), 100000 ),      // Arguments to construct a Light(): Light source position or 
                                  new Light( vec4( -10, -20, -14, 0 ), Color( 1, 1, .3, 1 ), 100    ) ];    // vector (homogeneous coordinates), color, and size.  
        /**********************************
        Start coding down here!!!!
        **********************************/                                     // From here on down it's just some example shapes drawn 
                                                                                // for you -- freely replace them with your own!
        model_transform = mult( model_transform, translation( 0, 5, 0 ) );
        this.shapes.triangle       .draw( graphics_state, model_transform,                      this.purplePlastic );
        
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.strip          .draw( graphics_state, model_transform,                      this.greyPlastic   );
        
        var t = graphics_state.animation_time/1000,   tilt_spin   = rotation( 700*t, [          .1,          .8,             .1 ] ),
                                                      funny_orbit = rotation(  90*t, [ Math.cos(t), Math.sin(t), .7*Math.cos(t) ] );

        // Many shapes can share influence from the same pair of lights, but they don't have to.  All the following shapes will use these lights instead of the above ones.
        graphics_state.lights = [ new Light( mult_vec( tilt_spin, vec4(  30,  30,  34, 1 ) ), Color( 0, .4, 0, 1 ), 100000               ),
                                  new Light( mult_vec( tilt_spin, vec4( -10, -20, -14, 0 ) ), Color( 1, 1, .3, 1 ), 100*Math.cos( t/10 ) ) ];
                                  
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.tetrahedron    .draw( graphics_state, mult( model_transform, funny_orbit ), this.purplePlastic );
        
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.bad_tetrahedron.draw( graphics_state, mult( model_transform, funny_orbit ), this.greyPlastic   );
        
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.windmill       .draw( graphics_state, mult( model_transform, tilt_spin ),   this.purplePlastic );
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.windmill       .draw( graphics_state, model_transform,                      this.fire          );
        model_transform = mult( model_transform, translation( 0, -2, 0 ) );
        this.shapes.windmill       .draw( graphics_state, model_transform,                      this.blueGlass     );
      }
  }, Scene_Component );  // End of class definition
        var fordir = 0;
        var backdir = 0;
        var rightdir = 0;
        var leftdir = 0;
        var updir = 0;
        var downdir = 0;
        var body_z = 0;
        var body_x = 0;
        var body_vx = 0;
        var body_vz = 0;
        var body_y = 0;
        var body_vy = 0;
  // *******************************************************************
  //  Assignment 1 would fit nicely into the following class definition:
  
Declare_Any_Class( "Shooting_Game",  // An example of drawing a hierarchical object using a "model_transform" matrix and post-multiplication.
  { 'construct'( context )
      { var shapes = { "box" : new        Cube(), 
                       "ball": new Grid_Sphere( 10, 10 ),
                       'triangle'        : new Triangle(),  
                       't': new T(),    
                       'b': new B(),                           // At the beginning of our program, instantiate all shapes we plan to use,
                       'strip'           : new Square(),                                // each with only one instance in the graphics card's memory.
                       'bad_tetrahedron' : new Tetrahedron( false ),                   // For example we would only create one "cube" blueprint in the GPU, but then 
                       'tetrahedron'     : new Tetrahedron( true ),                   // re-use it many times per call to display to get multiple cubes in the scene.
                       'windmill'        : new Windmill( 10 ) ,
                       'good_sphere' : new Subdivision_Sphere( 4 ),
                       'box'         : new Cube(),
                       'strip'       : new Square(),
                       'septagon'    : new Regular_2D_Polygon(  2,  7 ),
                       'tube'        : new Cylindrical_Tube  ( 10, 10 ),
                       'open_cone'   : new Cone_Tip          (  3, 10 ),
                       'donut'       : new Torus             ( 7, 10 ),
                       'bad_sphere'  : new Grid_Sphere       ( 10, 10 ),
                       'cone'        : new Closed_Cone       ( 10, 10 ),
                       'capped'      : new Capped_Cylinder   (  4, 12 ),
                       'axis'        : new Axis_Arrows(),
                       'prism'       :     Capped_Cylinder   .prototype.auto_flat_shaded_version( 10, 10 ),
                       'gem'         :     Subdivision_Sphere.prototype.auto_flat_shaded_version(  2     ),
                       'gem2'        :     Torus             .prototype.auto_flat_shaded_version( 20, 20 ),
                       'sphere' : new Grid_Sphere(20,20),
                       "teapot": new Shape_From_File( "teapot.obj" ),
                       "lego": new Shape_From_File( "lego.obj" ),
                       "person": new Shape_From_File( "person.obj" ),
                       "plane": new Shape_From_File( "plane.obj" ),
						'cone' : new Closed_Cone(10,10),
						'triangle'        : new Triangle(),
						'cylinder' : new Capped_Cylinder(4,12),
                       'bullet' : new Surface_Of_Revolution( 10, 10, 
                                            [ vec3( 2, 0, -1 ), vec3( 1, 0, 0 ), vec3( 1, 0, 1 ), vec3( 0, 0, 2 ) ], 360, [ [ 0, 7 ] [ 0, 7 ] ] )  };
        this.submit_shapes( context, shapes );
        
        this.define_data_members( { string_map:    context.globals.string_map, start_index: 0, tick: 0, visible: false, graphics_state: new Graphics_State(),
          yellow_clay: context.shaders_in_use["Phong_Model"].material( Color(  1,  1, .3, 1 ), .2, 1, .7, 40 ),
                                    brown_clay: context.shaders_in_use["Phong_Model"].material( Color( .5, .5, .3, 1 ), .2, 1,  1, 40 ),
                                    purplePlastic: context.shaders_in_use["Phong_Model" ].material( Color( .9,.5,.9, 1 ), .4, .4, .8, 40 ),
                                    greyPlastic  : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5,.5, 1 ), .4, .8, .4, 20 ),   // Smaller exponent means 
                                    blueGlass    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, 1,.2 ), .4, .8, .4, 40 ),     // a bigger shiny spot.
                                    gun   : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["123.png"] ),
                                    top   : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["top.png"] ),   
                                    bot   : context.shaders_in_use["Phong_Model" ].material( Color( 0,0, 0, 1 ), .5, .5, .5, 40, context.textures_in_use["t.png"] ),  // a bigger shiny spot.
                                    haozi   : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["mouse.png"] ),     // a bigger shiny spot.
                                    superman    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["superman.png"] ),     // a bigger shiny spot.
                                    star    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["star.png"] ), 
                                    stars: context.shaders_in_use["Phong_Model"  ].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["stars.png"]),
                                    con: context.shaders_in_use["Phong_Model"  ].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["ca.png"]),
                                    face: context.shaders_in_use["Phong_Model"  ].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["face.png"]),
                                    flower: context.shaders_in_use["Phong_Model"  ].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["flower.png"]),

                                    forest    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, .6, 1 ), .5, .5, .5, 40, context.textures_in_use["forest.png"] ),     // a bigger shiny spot.
                                    fire         : context.shaders_in_use["Funny_Shader"].material(),
                                  bluePlastic  : context.shaders_in_use["Phong_Model" ].material( Color( .1,.1,.9, 1 ), .4, .8, .4, 20 ), 
									orangePlastic  : context.shaders_in_use["Phong_Model" ].material( Color( 1,.5,.3, 1 ), .4, .8, .4, 20 ),
									brownPlastic  : context.shaders_in_use["Phong_Model" ].material( Color( .82,.7,.55, 1 ), .4, .8, .4, 20 ),
                                    blueGlass    : context.shaders_in_use["Phong_Model" ].material( Color( .5,.5, 1,.2 ), .4, .8, .4, 40 )        });
        this.globals = context.globals;

        
      },

      'draw_bullet'(model_transform,graphics_state)
      {
          var t = graphics_state.animation_time/10;
          model_transform = mult(model_transform, translation(8,0,0));
         // model_transform = mult(model_transform, translation(0,1,-1));
          model_transform = mult(model_transform, rotation((-90), 0, 1, 0));
          //model_transform = mult(model_transform, translation(0, 0, -1.5));
          model_transform = mult(model_transform, scale(0.5, 0.5, 1));
          this.shapes.bullet.draw( graphics_state, model_transform, this.brown_clay);
          model_transform = mult(model_transform, translation(0,0,-1));
          model_transform = mult(model_transform, scale(2, 2, 2));
          this.shapes.septagon.draw( graphics_state, model_transform, this.brown_clay);

      },
      'draw_pic'(model_transform,graphics_state)
      {
          
          model_transform = mult(model_transform, scale(42, 32, 1/2));
          model_transform = mult(model_transform, translation(0,0,-100));
          this.shapes.box.draw( graphics_state, model_transform, this.gun);
          model_transform = identity();
          model_transform = mult(model_transform, scale(1/2, 24, 40));
          model_transform = mult(model_transform, translation(-80,0,0));
          this.shapes.box.draw( graphics_state, model_transform, this.haozi);
          model_transform = identity();
          model_transform = mult(model_transform, scale(1/2, 25, 40));
          model_transform = mult(model_transform, translation(80,0,0));
          this.shapes.box.draw( graphics_state, model_transform, this.forest);
          model_transform = mult(model_transform, translation(-80,0,0));
          model_transform = mult(model_transform, scale(2, 1/25, 1/40));
          model_transform = mult(model_transform, scale(1/2, 5, 10));
          model_transform = mult(model_transform, translation(60,3,1));
          this.shapes.box.draw( graphics_state, model_transform, this.con);



      },

      'draw_target'(model_transform,graphics_state)
      {
          var t = graphics_state.animation_time/10;
          model_transform = mult(model_transform, translation(-10,0,0));
          model_transform = mult(model_transform, scale(10,10,10));
         model_transform = mult(model_transform, rotation((-90), 0, 1, 0));

         //this.shapes.t.draw( graphics_state, model_transform, this.brown_clay);
        //  model_transform = mult(model_transform, rotation((90), 1, 0, 0));
         // model_transform = mult(model_transform, scale(10, 10, 10));
         // model_transform = mult(model_transform, rotation((-90), 0, 0, 1));
          //this.shapes.t.draw( graphics_state, model_transform, this.star);
          //model_transform = mult(model_transform, rotation((90), 0, 0, 1));
          model_transform = mult(model_transform, scale(1/10, 1/10, 1/10));
          //this.shapes.donut.draw( graphics_state, model_transform, this.star);
          model_transform = mult(model_transform, scale(2, 2, 1));
          //this.shapes.donut.draw( graphics_state, model_transform, this.yellow_clay);
          model_transform = mult(model_transform, scale(1/2, 1/2, 1));
          model_transform = mult(model_transform, translation(0,-10,0));
           for(var i = 0; i < 8; i++)
          {
                  model_transform = mult(model_transform, translation(0, 0.5, 0));
                  model_transform = mult(model_transform, rotation( Math.sin(graphics_state.animation_time/700)*5, 0, 0, -1 ) );
                  model_transform = mult(model_transform, translation(0, 0.5, 0));
                  model_transform = mult(model_transform, scale(.25, 1, .25));
                   this.shapes.box.draw( graphics_state, model_transform, this.brown_clay);
                    model_transform = mult(model_transform, scale(4, 1, 4));
         }
         model_transform = mult(model_transform, translation(0, 2.5, 0));
                // model_transform = mult(model_transform, scale(1., 1.5, 1.5));
                this.shapes.donut.draw( graphics_state, model_transform, this.star);

      },
      'draw_person_leg'(model_transform,graphics_state)
      {
         model_transform = mult(model_transform, scale(0.3,1,0.3));
         this.shapes.box.draw( graphics_state, model_transform, this.yellow_clay);
      },
      'draw_person_arm'(model_transform,graphics_state)
      {
         //model_transform = mult(model_transform, rotation((90), 0, 0, 1));
         model_transform = mult(model_transform, translation(0.3,0,0.5));
         model_transform = mult(model_transform, scale(0.3,1,0.3));
         this.shapes.box.draw( graphics_state, model_transform, this.yellow_clay);
      },
      'draw_person_arm_with_gun'(model_transform,graphics_state)
      {
         var t = graphics_state.animation_time/1000
         if(t>1)
         {
              model_transform = mult(model_transform,translation(-10,1,0));
              model_transform = mult(model_transform, translation(10*(-t+1),0,0));
              this.draw_bullet(model_transform,graphics_state);
              model_transform = mult(model_transform, translation(-10*(-t+1),0,0));
              model_transform = mult(model_transform,translation(10,-1,0));
         }
         //model_transform = identity();
         model_transform = mult(model_transform, translation(-0.5,0,0));
         if(t<2)
         {
         model_transform = mult(model_transform, rotation(20*Math.cos(t), 0, 0, 1));
        }
        if(t<10 && t>2 )
        {
          model_transform = mult(model_transform, rotation((-90), 0, 0, 1));
          model_transform = mult(model_transform,rotation(20*Math.cos(t), 1, 0, 0))
        }
         model_transform = mult(model_transform, rotation((90), 0, 0, 1));
         model_transform = mult(model_transform, translation(0.3,0.2,0));
         model_transform = mult(model_transform, scale(0.3,1,0.3));
         this.shapes.box.draw( graphics_state, model_transform, this.yellow_clay);
         model_transform = mult(model_transform, scale(1/0.3,1,1/0.3));
         model_transform = mult(model_transform, rotation((-90), 0, 0, 1));
         model_transform = mult(model_transform, translation(-1,0.2,0));
         model_transform = mult(model_transform, scale(0.2,0.5,0.2));
         this.shapes.box.draw( graphics_state, model_transform, this.brown_clay);
         model_transform = mult(model_transform, scale(5,2,5));
         model_transform = mult(model_transform, translation(-0.3,0.5,0));
         model_transform = mult(model_transform, rotation((90), 0, 0, 1));
         model_transform = mult(model_transform, scale(0.2,0.5,0.2));
         this.shapes.box.draw( graphics_state, model_transform, this.brown_clay);
         model_transform = mult(model_transform, scale(1/0.2,1/0.5,1/0.2));
         model_transform = mult(model_transform, rotation((-90), 0, 0, 1));
         model_transform = identity();
         

         if(t>2)
         {
           graphics_state.camera_transform = lookAt([10,0,0], [-1,0,0], [0,1,0]);
         }
         if(t>4)
         {
           graphics_state.camera_transform = lookAt([-8,0,0], [1,0,0], [0,1,0]);
         }
         //var t = graphics_state.animation_time/400;
         //model_transform = mult(model_transform, translation(-t,0,0));
         //this.draw_bullet(model_transform,graphics_state);
      },

      'draw_person'(model_transform,graphics_state)
      {
          model_transform = mult(model_transform, translation(12,1,1));
          this.shapes.ball.draw( graphics_state, model_transform, this.yellow_clay);
          model_transform = mult(model_transform, translation(0,-2.2,0));
          model_transform = mult(model_transform, scale(0.5,1.3,1));
          this.shapes.box.draw( graphics_state, model_transform, this.superman);
          model_transform = mult(model_transform, scale(2,1/1.3,1));

          model_transform = mult(model_transform, translation(0,-2.3,0.6));
          this.draw_person_leg(model_transform,graphics_state);
          model_transform = mult(model_transform, translation(0, 2.3,-0.6));
          model_transform = mult(model_transform, translation(0,-2.3,-0.6));
          this.draw_person_leg(model_transform,graphics_state);
          model_transform = mult(model_transform, translation(0,2.3,0.6));
          model_transform = mult(model_transform, translation(-0.5, 0.2,-1.3));
          
          this.draw_person_arm_with_gun(model_transform,graphics_state);
          model_transform = mult(model_transform, translation(0,0,2));
          this.draw_person_arm(model_transform,graphics_state);
      },

      'draw_house'(model_transform,graphics_state)
      {           
                  var t = graphics_state.animation_time/1000
                  model_transform = mult(model_transform, scale(10, 10, 20));
                  model_transform = mult(model_transform, translation(2,0.4,0));
                  model_transform = mult(model_transform, rotation((-90), 1, 0, 0));
                  model_transform = mult(model_transform, rotation((-90), 0, 0, 1));
                  this.shapes.t.draw( graphics_state, model_transform, this.top);
                  this.shapes.b.draw( graphics_state, model_transform, this.bot);


      },
      'init_keys'(controls)
      {
          controls.add("up",this,function(){fordir = 1;});
          controls.add("up",this,function(){fordir = 0;},{'type':'keyup'});
          controls.add("down",this,function(){backdir = 1;});
          controls.add("down",this,function(){backdir = 0;},{'type':'keyup'});
          controls.add("left",this,function(){leftdir = 1;});
          controls.add("left",this,function(){leftdir = 0;},{'type':'keyup'});
          controls.add("right",this,function(){rightdir = 1;});
          controls.add("right",this,function(){rightdir = 0;},{'type':'keyup'});
          controls.add("i",this,function(){updir = 1;});
          controls.add("i",this,function(){updir = 0;},{'type':'keyup'});
          controls.add("k",this,function(){downdir = 1;});
          controls.add("k",this,function(){downdir = 0;},{'type':'keyup'});
      },

    'display'( graphics_state )
      { 
          var model_transform = identity();             // We have to reset model_transform every frame.
        
        // *** Lights: *** Values of vector or point lights over time.  Two different lights *per shape* supported; more requires changing a number in the vertex shader.
         graphics_state.lights = [ new Light( vec4(  30,  30,  34, 1 ), Color( 0, .4, 0, 1 ), 100000 ),      // Arguments to construct a Light(): Light source position or 
                                  new Light( vec4( -10, -20, -14, 0 ), Color( 1, 1, .3, 1 ), 100    ) ];

         var t = graphics_state.animation_time/1000;
        
              
        // model_transform = mult(model_transform, scale(10,10,10));
         //this.shapes.t.draw( graphics_state, model_transform, this.brown_clay);

         //this.shapes.triangle.draw( graphics_state, model_transform, this.brown_clay);
         this.draw_pic(model_transform,graphics_state);
         this.draw_house(model_transform,graphics_state);
         //this.draw_toy(model_transform,graphics_state);

        // model_transform = mult(model_transform, rotation(graphics_state.animation_time/20, 0, 1, 0));
        // model_transform = mult(model_transform, translation(-12,-1,-1));
      if(fordir){
        body_vz = .4;
      }
      else{
        body_vz = 0;
      }
      body_z += body_vz;

      if(backdir){
        body_vz = -.4;
      }
      else{
        body_vz = 0;
      }
      body_z += body_vz;

      if(leftdir){
        body_vx = -.4;
      }
      else{
        body_vx = 0;
      }
      body_x += body_vx;

      if(rightdir){
        body_vx = .4;
      }
      else{
        body_vx = 0;
      }
      body_x += body_vx;
      if(updir){
        body_vy = .4;
      }
      else{
        body_vy = 0;
      }
      body_y += body_vy;

      if(downdir){
        body_vy = -.4;
      }
      else{
        body_vy = 0;
      }
      body_y += body_vy;
      model_transform = translation(body_x,body_y,body_z)
      this.draw_person(model_transform,graphics_state);
               //model_transform = mult(model_transform, rotation(graphics_state.animation_time/20, 0, 1, 0));
        //this.shapes.person.draw( graphics_state, mult( model_transform, translation( 0, 0, 0 ) ), this.yellow_clay );
        model_transform = identity();
      this.draw_target(model_transform,graphics_state);
      model_transform = mult(model_transform,rotation(-90, 1,0,0));
      model_transform = mult(model_transform, translation(20,-8,5));
      model_transform = mult(model_transform, rotation(50*t, 0, 0, 1)); 
      model_transform = mult(model_transform, translation(4,0,0));
      model_transform = mult(model_transform, translation(0, 0,2*Math.sin(t)));
      model_transform = identity();   
      model_transform = mult(model_transform,translation(20,0,-10));
      model_transform = mult(model_transform,scale(0.4,5,0.4));
      this.shapes.box.draw( graphics_state, model_transform, this.brown_clay);
      model_transform = mult(model_transform,scale(1/0.4,1/5,1/0.4));
      model_transform = mult(model_transform,translation(0,6,0));
      if(t>4&&t<40)
      {
          model_transform = mult(model_transform,scale(1+t/10,1+t/10,1+t/10));
          model_transform = mult(model_transform, rotation(50*t, 0, 1, 0)); 
          this.shapes.ball.draw( graphics_state, model_transform, this.bluePlastic);
      }
      },
      'update_strings'(debug_screen_object){
        var t = this.tick++;
        if (!this.globals.animate)
        {
                  debug_screen_object.string_map["FPS"] = "FPS:  0";

        }
        debug_screen_object.string_map["FPS"] = "FPS: " + Math.round(t/ (Math.round(this.globals.graphics_state.animation_time)/1000));
      }

      
      
  }, Scene_Component );

  
  // ******************************************************************
  // The rest of this file is more code that powers the included demos.

Declare_Any_Class( "Debug_Screen",  // Debug_Screen - An example of a Scene_Component that our Canvas_Manager can manage.  Displays a text user interface.
  { 'construct'( context )
      { this.define_data_members( { string_map:    context.globals.string_map, start_index: 0, tick: 0, visible: false, graphics_state: new Graphics_State(),
                                    text_material: context.shaders_in_use["Phong_Model"].material( 
                                                                                Color(  0, 0, 0, 1 ), 1, 0, 0, 40, context.textures_in_use["text.png"] ) } );
        var shapes = { 'debug_text': new Text_Line( 35 ),
                       'cube':   new Cube() };
        this.submit_shapes( context, shapes );
      },
    'init_keys'( controls )
      { controls.add( "t",    this, function() { this.visible ^= 1;                                                                                                  } );
        controls.add( "up",   this, function() { this.start_index = ( this.start_index + 1 ) % Object.keys( this.string_map ).length;                                } );
        controls.add( "down", this, function() 
                                    { this.start_index = ( this.start_index - 1   + Object.keys( this.string_map ).length ) % Object.keys( this.string_map ).length; } );
        this.controls = controls;
      },
    'update_strings'( debug_screen_object )   // Strings that this Scene_Component contributes to the UI:
      { debug_screen_object.string_map["tick"]              = "Frame: " + this.tick++;
        debug_screen_object.string_map["text_scroll_index"] = "Text scroll index: " + this.start_index;
      },
    'display'( global_graphics_state )    // Leave these 3D global matrices unused, because this class is instead making a 2D user interface.
      { if( !this.visible ) return;
        var font_scale = scale( .02, .04, 1 ),
            model_transform = mult( translation( -.95, -.9, 0 ), font_scale ),
            strings = Object.keys( this.string_map );
  
        for( var i = 0, idx = this.start_index; i < 4 && i < strings.length; i++, idx = (idx + 1) % strings.length )
        { this.shapes.debug_text.set_string( this.string_map[ strings[idx] ] );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (each live-updated 
          model_transform = mult( translation( 0, .08, 0 ), model_transform );                      // logged value in each Scene_Component)
        }
        model_transform   = mult( translation( .7, .9, 0 ), font_scale );
        this.  shapes.debug_text.set_string( "Controls:" );
        this.  shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text

        for( let k of Object.keys( this.controls.all_shortcuts ) )
        { model_transform = mult( translation( 0, -0.08, 0 ), model_transform );
          this.shapes.debug_text.set_string( k );
          this.shapes.debug_text.draw( this.graphics_state, model_transform, this.text_material );  // Draw some UI text (the canvas's key controls)
        }
      }
  }, Scene_Component );

Declare_Any_Class( "Example_Camera",                  // An example of a Scene_Component that our Canvas_Manager can manage.  Adds both first-person and
  { 'construct'( context, canvas = context.canvas )   // third-person style camera matrix controls to the canvas.
      { // 1st parameter below is our starting camera matrix.  2nd is the projection:  The matrix that determines how depth is treated.  It projects 3D points onto a plane.
        context.globals.graphics_state.set( translation(0, 0,-25), perspective(45, context.width/context.height, .1, 1000), 0 );
        this.define_data_members( { graphics_state: context.globals.graphics_state, thrust: vec3(), origin: vec3( 0, 5, 0 ), looking: false } );

        // *** Mouse controls: ***
        this.mouse = { "from_center": vec2() };                           // Measure mouse steering, for rotating the flyaround camera:
        var mouse_position = function( e ) { return vec2( e.clientX - context.width/2, e.clientY - context.height/2 ); };   
        canvas.addEventListener( "mouseup",   ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = undefined;              } } ) (this), false );
        canvas.addEventListener( "mousedown", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.anchor = mouse_position(e);      } } ) (this), false );
        canvas.addEventListener( "mousemove", ( function(self) { return function(e) 
                                                                      { e = e || window.event;    self.mouse.from_center = mouse_position(e); } } ) (this), false );
        canvas.addEventListener( "mouseout",  ( function(self) { return function(e) { self.mouse.from_center = vec2(); }; } ) (this), false );  // Stop steering if the 
      },                                                                                                                                        // mouse leaves the canvas.
    'init_keys'( controls )   // init_keys():  Define any extra keyboard shortcuts here
      { controls.add( "Space", this, function() { this.thrust[1] = -1; } );     controls.add( "Space", this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "z",     this, function() { this.thrust[1] =  1; } );     controls.add( "z",     this, function() { this.thrust[1] =  0; }, {'type':'keyup'} );
        controls.add( "w",     this, function() { this.thrust[2] =  1; } );     controls.add( "w",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "a",     this, function() { this.thrust[0] =  1; } );     controls.add( "a",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( "s",     this, function() { this.thrust[2] = -1; } );     controls.add( "s",     this, function() { this.thrust[2] =  0; }, {'type':'keyup'} );
        controls.add( "d",     this, function() { this.thrust[0] = -1; } );     controls.add( "d",     this, function() { this.thrust[0] =  0; }, {'type':'keyup'} );
        controls.add( ",",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0,  1 ), this.graphics_state.camera_transform ); } );
        controls.add( ".",     this, function() { this.graphics_state.camera_transform = mult( rotation( 6, 0, 0, -1 ), this.graphics_state.camera_transform ); } );
        controls.add( "o",     this, function() { this.origin = mult_vec( inverse( this.graphics_state.camera_transform ), vec4(0,0,0,1) ).slice(0,3)         ; } );
        controls.add( "r",     this, function() { this.graphics_state.camera_transform = identity()                                                           ; } );
        controls.add( "f",     this, function() { this.looking  ^=  1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { var C_inv = inverse( this.graphics_state.camera_transform ), pos = mult_vec( C_inv, vec4( 0, 0, 0, 1 ) ),
                                                                  z_axis = mult_vec( C_inv, vec4( 0, 0, 1, 0 ) );
        user_interface_string_manager.string_map["origin" ] = "Center of rotation: " 
                                                              + this.origin[0].toFixed(0) + ", " + this.origin[1].toFixed(0) + ", " + this.origin[2].toFixed(0);
        user_interface_string_manager.string_map["cam_pos"] = "Cam Position: "
                                                              + pos[0].toFixed(2) + ", " + pos[1].toFixed(2) + ", " + pos[2].toFixed(2);    
        user_interface_string_manager.string_map["facing" ] = "Facing: " + ( ( z_axis[0] > 0 ? "West " : "East ")             // (Actually affected by the left hand rule)
                                                               + ( z_axis[1] > 0 ? "Down " : "Up " ) + ( z_axis[2] > 0 ? "North" : "South" ) );
      },
    'display'( graphics_state )
      { var leeway = 70,  degrees_per_frame = .0004 * graphics_state.animation_delta_time,
                          meters_per_frame  =   .01 * graphics_state.animation_delta_time;
        if( this.mouse.anchor )                                                         // Third-person "arcball" camera mode: Is a mouse drag occurring?
        { var dragging_vector = subtract( this.mouse.from_center, this.mouse.anchor );  // Spin the scene around the world origin on a user-determined axis.
          if( length( dragging_vector ) > 0 )
            graphics_state.camera_transform = mult( graphics_state.camera_transform,    // Post-multiply so we rotate the scene instead of the camera.
                mult( translation( this.origin ),
                mult( rotation( .05 * length( dragging_vector ), dragging_vector[1], dragging_vector[0], 0 ),
                      translation(scale_vec( -1, this.origin ) ) ) ) );
        }
        // First-person flyaround mode:  Determine camera rotation movement when the mouse is past a minimum distance (leeway) from the canvas's center.
        var offsets = { plus:  [ this.mouse.from_center[0] + leeway, this.mouse.from_center[1] + leeway ],
                        minus: [ this.mouse.from_center[0] - leeway, this.mouse.from_center[1] - leeway ] };
        if( this.looking ) 
          for( var i = 0; i < 2; i++ )      // Steer according to "mouse_from_center" vector, but don't start increasing until outside a leeway window from the center.
          { var velocity = ( ( offsets.minus[i] > 0 && offsets.minus[i] ) || ( offsets.plus[i] < 0 && offsets.plus[i] ) ) * degrees_per_frame;  // &&'s might zero these out.
            graphics_state.camera_transform = mult( rotation( velocity, i, 1-i, 0 ), graphics_state.camera_transform );   // On X step, rotate around Y axis, and vice versa.
          }     // Now apply translation movement of the camera, in the newest local coordinate frame
        graphics_state.camera_transform = mult( translation( scale_vec( meters_per_frame, this.thrust ) ), graphics_state.camera_transform );
      }
  }, Scene_Component );

Declare_Any_Class( "Flag_Toggler",  // A class that just interacts with the keyboard and reports strings
  { 'construct'( context ) { this.globals    = context.globals; },
    'init_keys'( controls )   //  Desired keyboard shortcuts
      { controls.add( "ALT+g", this, function() { this.globals.graphics_state.gouraud       ^= 1; } );   // Make the keyboard toggle some
        controls.add( "ALT+n", this, function() { this.globals.graphics_state.color_normals ^= 1; } );   // GPU flags on and off.
        controls.add( "ALT+a", this, function() { this.globals.animate                      ^= 1; } );
      },
    'update_strings'( user_interface_string_manager )   // Strings that this Scene_Component contributes to the UI:
      { user_interface_string_manager.string_map["time"]    = "Animation Time: " + Math.round( this.globals.graphics_state.animation_time )/1000 + "s";
        user_interface_string_manager.string_map["animate"] = "Animation " + (this.globals.animate ? "on" : "off") ;
      },
  }, Scene_Component );
  
Declare_Any_Class( "Surfaces_Tester",
  { 'construct'( context )
      { context.globals.animate = true;
        var shapes = { 'good_sphere' : new Subdivision_Sphere( 4 ),
                       'box'         : new Cube(),
                       'strip'       : new Square(),
                       'septagon'    : new Regular_2D_Polygon(  2,  7 ),
                       'tube'        : new Cylindrical_Tube  ( 10, 10 ),
                       'open_cone'   : new Cone_Tip          (  3, 10 ),
                       'donut'       : new Torus             ( 15, 15 ),
                       'bad_sphere'  : new Grid_Sphere       ( 10, 10 ),
                       'cone'        : new Closed_Cone       ( 10, 10 ),
                       'capped'      : new Capped_Cylinder   (  4, 12 ),
                       'axis'        : new Axis_Arrows(),
                       'prism'       :     Capped_Cylinder   .prototype.auto_flat_shaded_version( 10, 10 ),
                       'gem'         :     Subdivision_Sphere.prototype.auto_flat_shaded_version(  2     ),
                       'gem2'        :     Torus             .prototype.auto_flat_shaded_version( 20, 20 ),
                       'swept_curve' : new Surface_Of_Revolution( 10, 10, 
                                            [ vec3( 2, 0, -1 ), vec3( 1, 0, 0 ), vec3( 1, 0, 1 ), vec3( 0, 0, 2 ) ], 120, [ [ 0, 7 ] [ 0, 7 ] ] ) 
                     };
        this.submit_shapes( context, shapes );
        this.define_data_members( { shader: context.shaders_in_use["Phong_Model"], textures: Object.values( context.textures_in_use ) } );
      },
    'draw_all_shapes'( model_transform, graphics_state )
      { var i = 0, t = graphics_state.animation_time / 1000;
        
        for( key in this.shapes )
        { i++;
          var funny_function_of_time = 50*t + i*i*Math.cos( t/2 ),
              random_material        = this.shader.material( Color( (i % 7)/7, (i % 6)/6, (i % 5)/5, 1 ), .2, 1, 1, 40, this.textures[ i % this.textures.length ] )
              
          model_transform = mult( model_transform, rotation( funny_function_of_time, i%3 == 0, i%3 == 1, i%3 == 2 ) );   // Irregular motion
          model_transform = mult( model_transform, translation( 0, -3, 0 ) );
          this.shapes[ key ].draw( graphics_state, model_transform, random_material );        //  Draw the current shape in the list    
        }
        return model_transform;     
      },
    'display'( graphics_state )
      { var model_transform = identity(); 
        for( var i = 0; i < 7; i++ )                                    // Another example of not every shape owning the same pair of lights:
        { graphics_state.lights = [ new Light( vec4( i % 7 - 3, i % 6 - 3, i % 5 - 3, 1 ), Color( 1, 0, 0, 1 ), 100000000 ),
                                    new Light( vec4( i % 6 - 3, i % 5 - 3, i % 7 - 3, 1 ), Color( 0, 1, 0, 1 ), 100000000 ) ];
        
          model_transform = this.draw_all_shapes( model_transform, graphics_state );      // *** How to call a function and still have a single matrix state ***
          model_transform = mult( model_transform, rotation( 360 / 13, 0, 0, 1 ) );
        }
      }
  }, Scene_Component );
  
Declare_Any_Class( "Star",    // An example of animating without making any extremely customized primitives.
  { 'construct'( context )    // Each frame manages to show one million points connected by half as many flat-colored triangles.
      { context.globals.animate = true;
        context.globals.graphics_state.animation_time = 90000;
        this.shader = context.shaders_in_use["Phong_Model"];
        var shapes = { "torus": Torus.prototype.auto_flat_shaded_version( 25, 25 ) };
        shapes.torus.indexed = false;             // Just to additionally test non-indexed shapes somewhere, use the fact that in this 
        this.submit_shapes( context, shapes );    // flat-shaded shape (no shared vertices) the index list is redundant.
      },
    'display'( graphics_state )
      { var t = graphics_state.animation_time/500,   funny_orbit = rotation(  90*t, [ Math.cos(t), Math.sin(t), .7*Math.cos(t) ] );
        graphics_state.lights = [ new Light( mult_vec( funny_orbit, vec4(  30,  30,  34, 1 ) ), Color( 0, .4, 0, 1 ), 100000               ),
                                  new Light( mult_vec( funny_orbit, vec4( -10, -20, -14, 0 ) ), Color( 1, 1, .3, 1 ), 100*Math.cos( t/10 ) ) ];
        for( var j = 0; j < 20; j++ )
          for( var i = 0; i < 20; i++ )
          {            
            var model_transform =                        rotation   ( j * 18 *                  t/60  , 0, 0, 1   );
                model_transform = mult( model_transform, rotation   ( i * 18 * Math.sin(        t/21 ), 0, 1, 0 ) );
                model_transform = mult( model_transform, translation( 2 * i  * Math.sin(        t/31 ), 0, 0    ) );
                model_transform = mult( model_transform, scale      ( 1,  1  + Math.sin( i*18 * t/41 ), 1       ) );
            
            this.shapes.torus.draw( graphics_state, model_transform, this.shader.material( Color( i/10, j/20, 0, 1 ), .2, .8, .5, 20 ) );
          }
      }
  }, Scene_Component );

Declare_Any_Class( "Bump_Map_And_Mesh_Loader",     // An example where one teapot has a bump-mapping-like hack, and the other does not.
  { 'construct'( context )
      { context.globals.animate = true;
        context.globals.graphics_state.camera_transform = translation( 0, 0, -5 );
      
        var shapes = { "teapot": new Shape_From_File( "teapot.obj" ) };
        this.submit_shapes( context, shapes );
        this.define_data_members( { stars: context.shaders_in_use["Phong_Model"  ].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["stars.png"] ),
                                    bumps: context.shaders_in_use["Fake_Bump_Map"].material( Color( .5,.5,.5,1 ), .5, .5, .5, 40, context.textures_in_use["stars.png"] )});
      },
    'display'( graphics_state )
      { var t = graphics_state.animation_time;
        graphics_state.lights = [ new Light( mult_vec( rotation( t/5, 1, 0, 0 ), vec4(  3,  2,  10, 1 ) ), Color( 1, .7, .7, 1 ), 100000 ) ];
        
        for( let i of [ -1, 1 ] )
        { var model_transform = mult( rotation( t/40, 0, 2, 1 ), translation( 2*i, 0, 0 ) );
              model_transform = mult( model_transform, rotation( t/25, -1, 2, 0 ) );
          this.shapes.teapot.draw( graphics_state, mult( model_transform, rotation( -90, 1, 0, 0 ) ), i == 1 ? this.stars : this.bumps );
        }
      }
  }, Scene_Component );
  
  
  // DISCLAIMER:  The collision method shown below is not used by anyone; it's just very quick to code.  Making every collision body a stretched sphere is kind 
  // of a hack, and looping through a list of discrete sphere points to see if the volumes intersect is *really* a hack (there are perfectly good analytic 
  // expressions that can test if two ellipsoids intersect without discretizing them into points).   On the other hand, for non-convex shapes you're usually going
  // to have to loop through a list of discrete tetrahedrons defining the shape anyway.
Declare_Any_Class( "Body",
  { 'construct'(s, m) { this.randomize(s, m); },
    'randomize'(s, m)
      { this.define_data_members( { shape: s, scale: [1, 1+Math.random(), 1],
                                    location_matrix: mult( rotation( 360 * Math.random(), random_vec3(1) ), translation( random_vec3(10) ) ), 
                                    linear_velocity: random_vec3(.1), 
                                    angular_velocity: .5*Math.random(), spin_axis: random_vec3(1),
                                    material: m } )
      },
    'advance'( b, time_amount )   // Do one timestep.
      { var delta = translation( scale_vec( time_amount, b.linear_velocity ) );  // Move proportionally to real time.
        b.location_matrix = mult( delta, b.location_matrix );                    // Apply translation velocity - pre-multiply to keep translations together
        
        delta = rotation( time_amount * b.angular_velocity, b.spin_axis );       // Move proportionally to real time.
        b.location_matrix = mult( b.location_matrix, delta );                    // Apply angular velocity - post-multiply to keep rotations together    
      },
    'check_if_colliding'( b, a_inv, shape )   // Collision detection function
      { if ( this == b ) return false;        // Nothing collides with itself
        var T = mult( a_inv, mult( b.location_matrix, scale( b.scale ) ) );  // Convert sphere b to a coordinate frame where a is a unit sphere
        for( let p of shape.positions )                                      // For each vertex in that b,
        { var Tp = mult_vec( T, p.concat(1) ).slice(0,3);                    // Apply a_inv*b coordinate frame shift
          if( dot( Tp, Tp ) < 1.2 )   return true;     // Check if in that coordinate frame it penetrates the unit sphere at the origin.     
        }
        return false;
      }
  });
  
Declare_Any_Class( "Simulation_Scene_Superclass",
  { 'construct'( context )
      { context.globals.animate = true;
        this.define_data_members( { bodies: [], shader: context.shaders_in_use["Phong_Model"], stars: context.textures_in_use["stars.png"] } );
        
        var shapes = { "donut"       : new Torus( 15, 15 ),
                       "cone"        : new Closed_Cone( 10, 10 ),
                       "capped"      : new Capped_Cylinder( 4, 12 ),
                       "axis"        : new Axis_Arrows(),
                       "prism"       :     Capped_Cylinder   .prototype.auto_flat_shaded_version( 10, 10 ),
                       "gem"         :     Subdivision_Sphere.prototype.auto_flat_shaded_version( 2 ),
                       "gem2"        :     Torus             .prototype.auto_flat_shaded_version( 20, 20 ) };
        this.submit_shapes( context, shapes );
      },
    'random_shape'() { return Object.values( this.shapes )[ Math.floor( 7*Math.random() ) ] },
    'random_material'() { return this.shader.material( Color( 1,Math.random(),Math.random(),1 ), .1, 1, 1, 40, this.stars ) },
    'display'( graphics_state )
      { graphics_state.lights = [ new Light( vec4(5,1,1,0), Color( 1, 1, 1, 1 ), 10000 ) ];
                                              
        if( Math.random() < .02 ) this.bodies.splice( 0, this.bodies.length/4 ); // Sometimes we delete some so they can re-generate as new ones
        for( let b of this.bodies )
        { b.shape.draw( graphics_state, mult( b.location_matrix, scale( b.scale ) ), b.material ); // Draw each shape at its current location 
          b.advance( b, graphics_state.animation_delta_time );
        }
        this.simulate();    // This is an abstract class; call the subclass's version
      },
  }, Scene_Component );

Declare_Any_Class( "Ground_Collision_Scene",    // Scenario 1: Let random initial momentums carry bodies until they fall and bounce.
  { 'simulate'()
      { while( this.bodies.length < 100 )   this.bodies.push( new Body(this.random_shape(), this.random_material()) );      // Generate moving bodies  
        for( let b of this.bodies )
        { b.linear_velocity[1] += .0001 * -9.8;       // Gravity.
          if( b.location_matrix[1][3] < -4 && b.linear_velocity[1] < 0 ) b.linear_velocity[1] *= -.8;   // If about to fall through floor, reverse y velocity.     
        }
      }
  }, Simulation_Scene_Superclass );
 
Declare_Any_Class( "Object_Collision_Scene",    // Scenario 2: Detect when some flying objects collide with one another, coloring them red.    
  { 'simulate'()
      { if   ( this.bodies.length > 20 )       this.bodies = this.bodies.splice( 0, 20 );                                   // Max of 20 bodies
        while( this.bodies.length < 20 )       this.bodies.push( new Body(this.random_shape(), this.random_material()) );   // Generate moving bodies  
        
        if( ! this.collider ) this.collider = new Subdivision_Sphere(1);      // The collision shape should be simple
        
        for( let b of this.bodies )
        { var b_inv = inverse( mult( b.location_matrix, scale( b.scale ) ) );               // Cache b's final transform
          
          var center = mult_vec( b.location_matrix, vec4( 0, 0, 0, 1 ) ).slice(0,3);        // Center of the body
          b.linear_velocity = subtract( b.linear_velocity, scale_vec( .0003, center ) );    // Apply a small centripetal force to everything
          b.material = this.shader.material( Color( 1,1,1,1 ), .1, 1, 1, 40, this.stars );              // Default color: white
         
          for( let c of this.bodies )                                      // Collision process starts here
            if( b.check_if_colliding( c, b_inv, this.collider ) )          // Send the two bodies and the collision shape
            { b.material = this.shader.material( Color( 1,0,0,1 ), .1, 1, 1, 40, this.stars );        // If we get here, we collided, so turn red
              b.linear_velocity  = vec3();                                 // Zero out the velocity so they don't inter-penetrate more
              b.angular_velocity = 0;
            }   
        }   
      }
  }, Simulation_Scene_Superclass );