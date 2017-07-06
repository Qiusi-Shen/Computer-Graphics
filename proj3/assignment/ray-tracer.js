// CS 174a Project 3 Ray Tracer Skeleton

var mult_3_coeffs = function( a, b ) { return [ a[0]*b[0], a[1]*b[1], a[2]*b[2] ]; };       // Convenient way to combine two color-reducing vectors

Declare_Any_Class( "Ball",              // The following data members of a ball are filled in for you in Ray_Tracer::parse_line():
  { 'construct'( position, size, color, k_a, k_d, k_s, n, k_r, k_refract, refract_index )
      { this.define_data_members( { position, size, color, k_a, k_d, k_s, n, k_r, k_refract, refract_index } );
        
  // TODO:  Finish filling in data members, using data already present in the others.
        this.model_transform = identity();
        this.model_transform = mult(this.model_transform, translation(this.position[0], this.position[1], this.position[2]));
        this.model_transform = mult(this.model_transform, scale(this.size[0], this.size[1], this.size[2]));
        this.inverse_transform = inverse(this.model_transform);

      },
    'intersect'( ray, existing_intersection, minimum_dist )
      {

  // TODO:  Given a ray, check if this Ball is in its path.  Recieves as an argument a record of the nearest intersection found so far (a Ball pointer, a t distance
  //        value along the ray, and a normal), updates it if needed, and returns it.  Only counts intersections that are at least a given distance ahead along the ray.
  //        Tip:  Once intersect() is done, call it in trace() as you loop through all the spheres until you've found the ray's nearest available intersection.  Simply
  //        return a dummy color if the intersection tests positiv.  This will show the spheres' outlines, giving early proof that you did intersect() correctly.
        var inv_trans = this.inverse_transform; 

        var Vec_S = mult_vec(inv_trans, ray.origin.slice());
        var Vec_C = mult_vec(inv_trans, ray.dir.slice());

        Vec_S= Vec_S.slice(0,3);
        Vec_C= Vec_C.slice(0,3);

        var a = dot(Vec_C, Vec_C);
        var b = dot(Vec_S, Vec_C);
        var c = dot(Vec_S, Vec_S) -1; 

        var discriminant = b*b - a*c;
        var t=Math.sqrt(discriminant);

        if(discriminant  < 0)
          return existing_intersection; 
      
        var t1=(-b+t)/a;
        var t2=(-b-t)/a; 
        
        this.tmin = Math.min(this.t1, this.t2);
        this.tmax = Math.max(this.t1, this.t2);

        if(t1 < minimum_dist || t1 > t2)
            t1 = t2;
        if(t1 < minimum_dist || t1 >= existing_intersection.distance)
            return existing_intersection;

          var trans = transpose(inv_trans);
          var inter=add(Vec_S, scale_vec(t1, Vec_C));
          inter = vec4(inter[0], inter[1], inter[2], 1);
          var normal = mult_vec(trans, inter).slice(0,3);

          existing_intersection.normal = normal
          existing_intersection.ball=this;
          existing_intersection.distance=t1; 

        return existing_intersection;

        }
  } );

Declare_Any_Class( "Ray_Tracer",
  { 'construct'( context )
      { this.define_data_members( { width: 32, height: 32, near: 1, left: -1, right: 1, bottom: -1, top: 1, ambient: [.1, .1, .1],
                                    balls: [], lights: [], curr_background_function: "color", background_color: [0, 0, 0, 1 ],
                                    scanline: 0, visible: true, scratchpad: document.createElement('canvas'), gl: context.gl,
                                    shader: context.shaders_in_use["Phong_Model"] } );
        var shapes = { "square": new Square(),                  // For texturing with and showing the ray traced result
                       "sphere": new Subdivision_Sphere( 4 ) };   // For drawing with ray tracing turned off
        this.submit_shapes( context, shapes );

        this.texture = new Texture ( context.gl, "", false, false );           // Initial image source: Blank gif file
        this.texture.image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        context.textures_in_use[ "procedural" ]  =  this.texture;

        this.scratchpad.width = this.width;  this.scratchpad.height = this.height;
        this.imageData          = new ImageData( this.width, this.height );     // Will hold ray traced pixels waiting to be stored in the texture
        this.scratchpad_context = this.scratchpad.getContext('2d');             // A hidden canvas for assembling the texture
        //this.level = 0;
        this.background_functions =                 // These convert a ray into a color even when no balls were struck by the ray.
          { waves: function( ray )
            { return Color( .5*Math.pow( Math.sin( 2*ray.dir[0] ), 4 ) + Math.abs( .5*Math.cos( 8*ray.dir[0] + Math.sin( 10*ray.dir[1] ) + Math.sin( 10*ray.dir[2] ) ) ),
                            .5*Math.pow( Math.sin( 2*ray.dir[1] ), 4 ) + Math.abs( .5*Math.cos( 8*ray.dir[1] + Math.sin( 10*ray.dir[0] ) + Math.sin( 10*ray.dir[2] ) ) ),
                            .5*Math.pow( Math.sin( 2*ray.dir[2] ), 4 ) + Math.abs( .5*Math.cos( 8*ray.dir[2] + Math.sin( 10*ray.dir[1] ) + Math.sin( 10*ray.dir[0] ) ) ), 1 );
            },
            lasers: function( ray ) 
            { var u = Math.acos( ray.dir[0] ), v = Math.atan2( ray.dir[1], ray.dir[2] );
              return Color( 1 + .5 * Math.cos( 20 * ~~u  ), 1 + .5 * Math.cos( 20 * ~~v ), 1 + .5 * Math.cos( 8 * ~~u ), 1 );
            },
            mixture:     ( function( ray ) { return mult_3_coeffs( this.background_functions["waves" ]( ray ), 
                                                                   this.background_functions["lasers"]( ray ) ).concat(1); } ).bind( this ),
            ray_direction: function( ray ) { return Color( Math.abs( ray.dir[ 0 ] ), Math.abs( ray.dir[ 1 ] ), Math.abs( ray.dir[ 2 ] ), 1 );  },
            color:       ( function( ray ) { return this.background_color;  } ).bind( this )
          };       
        this.make_menu();
        this.load_case( "show_homework_spec" );
      },
    'get_dir'( ix, iy )   
      {
    // TODO:  Map an (x,y) pixel to a corresponding xyz vector that reaches the near plane.  If correct, everything under the "background effects" menu will now work. 
         
          var alpha = ix/(this.width);
          var beta = iy/(this.height);
          var x = parseFloat(this.left) + alpha*(this.right - this.left);
          var y = parseFloat(this.bottom) + beta*(this.top - this.bottom);

         return vec4( x, y, -this.near, 0 );
      },
    'color_missed_ray'( ray ) { return mult_3_coeffs( this.ambient, this.background_functions[ this.curr_background_function ] ( ray ) ).concat(1); },
    'trace'( ray, color_remaining, is_primary, light_to_check = null )
      {
    // TODO:  Given a ray, return the color in that ray's path.  The ray either originates from the camera itself or from a secondary reflection or refraction off of a
    //        ball.  Call Ball.prototype.intersect on each ball to determine the nearest ball struck, if any, and perform vector math (the Phong reflection formula)
    //        using the resulting intersection record to figure out the influence of light on that spot.  Recurse for reflections and refractions until the final color
    //        is no longer significantly affected by more bounces.
    //
    //        Arguments besides the ray include color_remaining, the proportion of brightness this ray can contribute to the final pixel.  Only if that's still
    //        significant, proceed with the current recursion, computing the Phong model's brightness of each color.  When recursing, scale color_remaining down by k_r
    //        or k_refract, multiplied by the "complement" (1-alpha) of the Phong color this recursion.  Use argument is_primary to indicate whether this is the original
    //        ray or a recursion.  Use the argument light_to_check when a recursive call to trace() is for computing a shadow ray.
        if( length( color_remaining.slice()) < .3 )    return Color( 0, 0, 0, 1 );  // Each recursion, check if there's any remaining potential for the pixel to be brightened.

        var closest_intersection = { distance: Number.POSITIVE_INFINITY, ball: null, normal: null } 

        if(is_primary)
        for(let b of this.balls)
        {
          b.intersect(ray, closest_intersection, 0.0001);
          if(closest_intersection.distance <= this.near)
          {
            closest_intersection.normal = scale_vec(-1, closest_intersection.normal);
          }
        }
        
        else if(!is_primary)
        for(let b of this.balls){
          b.intersect(ray, closest_intersection, 0.0001);
        }
        
        if( !closest_intersection.ball ) return this.color_missed_ray( ray );

        var ball = closest_intersection.ball; 

        var tem = normalize(scale_vec(-1*closest_intersection.distance, ray.dir).slice(0,3));
        var Ball_c = scale_vec(ball.k_a, ball.color);
        var diffusion = vec3(0, 0, 0);
        var specular = vec3(0, 0, 0);
        var inter = add(ray.origin, scale_vec(closest_intersection.distance, ray.dir)).slice(0,3);
        var Norm = normalize(closest_intersection.normal); 

          for (let t of this.lights) 
          {
              var shadow_dir = vec4(t.position[0]-inter[0], t.position[1]-inter[1], t.position[2]-inter[2], 0);
              var shadow_ray = {origin: vec4(inter[0], inter[1], inter[2], 1), dir: shadow_dir}; 
              var shadow_int = { distance: Number.POSITIVE_INFINITY, ball: null, normal: null };
              for( let b of this.balls){
                b.intersect(shadow_ray, shadow_int, 0.0001)
              }
             if(shadow_int.distance > 1){
              var Im = normalize(vec3(t.position[0]-inter[0], t.position[1]-inter[1], t.position[2]-inter[2])); 
              var light_color = t.color.slice(0,3);

             if(dot(Norm, Im) > 0)
             {
                diffusion = add(diffusion, mult_3_coeffs(light_color, scale_vec(ball.k_d*dot(Norm, Im), ball.color))); 
             }
             var Ret = normalize(subtract(scale_vec(dot(Norm, Im)*2, Norm), Im));
             if(dot(tem, Ret) > 0){
                specular = add(specular, mult_3_coeffs(light_color, scale_vec(ball.k_s * Math.pow(dot(tem, Ret), ball.n), vec3(1, 1, 1))));
              }

          }
        }

        Ball_c= add(add(Ball_c, diffusion),specular);

        var Ball_r = mult_3_coeffs(subtract( Color(1,1,1,1).slice(0,3), Ball_c), scale_vec(1/ball.k_r, color_remaining));
        var Ball_t = mult_3_coeffs(subtract( Color(1,1,1,1).slice(0,3), Ball_c), scale_vec(1/ball.k_refract, color_remaining));

        var Mo = scale_vec(-1, normalize(ray.dir.slice(0,3)));
        var r_dir = normalize(subtract(scale_vec(2*dot(Norm,Mo),Norm),Mo));
        var r_ray = { origin: inter.concat(1), dir: r_dir.concat(0)};
        var c_color = mult(subtract(vec3(1, 1, 1), Ball_c), scale_vec(ball.k_r, this.trace(r_ray, Ball_r, false, 0).slice(0, 3)));
        c_color = vec4(c_color[0], c_color[1], c_color[2], 0); 
        
        Mo = scale_vec(1, ray.dir.slice(0,3));
        var temp1 = scale_vec(ball.refract_index*dot(scale_vec(-1,Norm),Mo)-Math.sqrt(1-Math.pow(ball.refract_index,2)*(1-Math.pow(dot(scale_vec(-1,Norm),Mo),2))),Norm);
        var rw_ray = normalize(add(scale_vec(ball.refract_index, Mo), temp1));
        var r_ray = { origin: inter.concat(1), dir: rw_ray.concat(0) };
        var r_color = scale_vec(ball.k_refract, this.trace(r_ray, Ball_t, false, false).slice(0,3)).concat(0);

        return add(add(vec4(Ball_c[0], Ball_c[1], Ball_c[2], 1), c_color), r_color);
      },

    'parse_line'( tokens )            // Load the lines from the textbox into variables
      { for( let i = 1; i < tokens.length; i++ ) tokens[i] = Number.parseFloat( tokens[i] );
        switch( tokens[0] )
          { case "NEAR":    this.near   = tokens[1];  break;
            case "LEFT":    this.left   = tokens[1];  break;
            case "RIGHT":   this.right  = tokens[1];  break;
            case "BOTTOM":  this.bottom = tokens[1];  break;
            case "TOP":     this.top    = tokens[1];  break;
            case "RES":     this.width             = tokens[1];   this.height            = tokens[2]; 
                            this.scratchpad.width  = this.width;  this.scratchpad.height = this.height; break;
            case "SPHERE":
              this.balls.push( new Ball( [tokens[1], tokens[2], tokens[3]], [tokens[4], tokens[5], tokens[6]], [tokens[7],tokens[8],tokens[9]], 
                                          tokens[10],tokens[11],tokens[12],  tokens[13],tokens[14],tokens[15],  tokens[16] ) ); break;
            case "LIGHT":   this.lights.push( new Light( [ tokens[1],tokens[2],tokens[3], 1 ], Color( tokens[4],tokens[5],tokens[6], 1 ),    10000000 ) ); break;
            case "BACK":    this.background_color = Color( tokens[1],tokens[2],tokens[3], 1 ); this.gl.clearColor.apply( this.gl, this.background_color ); break;
            case "AMBIENT": this.ambient = [tokens[1], tokens[2], tokens[3]];          
          }
      },
    'parse_file'()        // Move through the text lines
      { this.balls = [];   this.lights = [];
        this.scanline = 0; this.scanlines_per_frame = 1;                            // Begin at bottom scanline, forget the last image's speedup factor
        document.getElementById("progress").style = "display:inline-block;";        // Re-show progress bar
        this.camera_needs_reset = true;                                             // Reset camera
        var input_lines = document.getElementById( "input_scene" ).value.split("\n");
        for( let i of input_lines ) this.parse_line( i.split(/\s+/) );
      },
    'load_case'( i ) {   document.getElementById( "input_scene" ).value = test_cases[ i ];   },
    'make_menu'()
      { document.getElementById( "raytracer_menu" ).innerHTML = "<span style='white-space: nowrap'> \
          <button id='toggle_raytracing' class='dropbtn' style='background-color: #AF4C50'>Toggle Ray Tracing</button> \
          <button onclick='document.getElementById(\"myDropdown2\").classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #8A8A4C'> \
          Select Background Effect</button><div  id='myDropdown2' class='dropdown-content'>  </div>\
          <button onclick='document.getElementById(\"myDropdown\" ).classList.toggle(\"show\"); return false;' class='dropbtn' style='background-color: #4C50AF'> \
          Select Test Case</button        ><div  id='myDropdown' class='dropdown-content'>  </div> \
          <button id='submit_scene' class='dropbtn'>Submit Scene Textbox</button> \
          <div id='progress' style = 'display:none;' ></div></span>";
        for( let i in test_cases )
          { var a = document.createElement( "a" );
            a.addEventListener("click", function() { this.load_case( i ); this.parse_file(); }.bind( this    ), false);
            a.innerHTML = i;
            document.getElementById( "myDropdown"  ).appendChild( a );
          }
        for( let j in this.background_functions )
          { var a = document.createElement( "a" );
            a.addEventListener("click", function() { this.curr_background_function = j;      }.bind( this, j ), false);
            a.innerHTML = j;
            document.getElementById( "myDropdown2" ).appendChild( a );
          }
        
        document.getElementById( "input_scene" ).addEventListener( "keydown", function(event) { event.cancelBubble = true; }, false );
        
        window.addEventListener( "click", function(event) {  if( !event.target.matches('.dropbtn') ) {    
          document.getElementById( "myDropdown"  ).classList.remove("show");
          document.getElementById( "myDropdown2" ).classList.remove("show"); } }, false );

        document.getElementById( "toggle_raytracing" ).addEventListener("click", this.toggle_visible.bind( this ), false);
        document.getElementById( "submit_scene"      ).addEventListener("click", this.parse_file.bind(     this ), false);
      },
    'toggle_visible'() { this.visible = !this.visible; document.getElementById("progress").style = "display:inline-block;" },
    'set_color'( ix, iy, color )                           // Sends a color to one pixel index of our final result
      { var index = iy * this.width + ix;
        this.imageData.data[ 4 * index     ] = 255.9 * color[0];    
        this.imageData.data[ 4 * index + 1 ] = 255.9 * color[1];    
        this.imageData.data[ 4 * index + 2 ] = 255.9 * color[2];    
        this.imageData.data[ 4 * index + 3 ] = 255;  
      },
    'init_keys'( controls ) { controls.add( "SHIFT+r", this, this.toggle_visible ); },
    'display'( graphics_state )
      { graphics_state.lights = this.lights;
        graphics_state.projection_transform = perspective(90, 1, 1, 1000);
        if( this.camera_needs_reset ) { graphics_state.camera_transform = identity(); this.camera_needs_reset = false; }
        
        if( !this.visible )                          // Raster mode, to draw the same shapes out of triangles when you don't want to trace rays
        { for( let b of this.balls ) this.shapes.sphere.draw( graphics_state, b.model_transform, this.shader.material( b.color.concat(1), b.k_a, b.k_d, b.k_s, b.n ) );
          this.scanline = 0;    document.getElementById("progress").style = "display:none";     return; 
        } 
        if( !this.texture || !this.texture.loaded ) return;      // Don't display until we've got our first procedural image
        this.scratchpad_context.drawImage( this.texture.image, 0, 0 );
        this.imageData = this.scratchpad_context.getImageData( 0, 0, this.width, this.height );    // Send the newest pixels over to the texture
        var camera_inv = inverse( graphics_state.camera_transform );
        
        var desired_milliseconds_per_frame = 100;
        if( ! this.scanlines_per_frame ) this.scanlines_per_frame = 1;
        var milliseconds_per_scanline = Math.max( graphics_state.animation_delta_time / this.scanlines_per_frame, 1 );
        this.scanlines_per_frame = desired_milliseconds_per_frame / milliseconds_per_scanline + 1;
        for( var i = 0; i < this.scanlines_per_frame; i++ )     // Update as many scanlines on the picture at once as we can, based on previous frame's speed
        { var y = this.scanline++;
          if( y >= this.height ) { this.scanline = 0; document.getElementById("progress").style = "display:none" };
          document.getElementById("progress").innerHTML = "Rendering ( " + 100 * y / this.height + "% )..."; 
          for ( var x = 0; x < this.width; x++ )
          { var ray = { origin: mult_vec( camera_inv, vec4(0, 0, 0, 1) ), dir: mult_vec( camera_inv, this.get_dir( x, y ) ) };   // Apply camera
            this.set_color( x, y, this.trace( ray, [1,1,1], true ) );                                    // ******** Trace a single ray *********
          }
        }
        this.scratchpad_context.putImageData( this.imageData, 0, 0);          // Draw the image on the hidden canvas
        this.texture.image.src = this.scratchpad.toDataURL("image/png");      // Convert the canvas back into an image and send to a texture
        
        this.shapes.square.draw( new Graphics_State( identity(), identity(), 0 ), translation(0,0,-1), this.shader.material( Color( 0, 0, 0, 1 ), 1,  0, 0, 1, this.texture ) );
      }
  }, Scene_Component );