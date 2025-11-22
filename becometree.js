(function() {
    // Check if the 'players' object exists and has players in it
    if (typeof players === 'undefined' || Object.keys(players).length === 0) {
        console.log("Could not find the 'players' object or it's empty.");
        console.log("Please make sure you have joined a game first!");
        return; // Stop the script
    }

    // We need to track our own time for the new camera logic
    var modLastTime = performance.now();

    try {
        // 1. Define the tree GEOMETRY ONCE.
        // This is more efficient. We will create the material inside the loop.
        var treeGeometry = new THREE.CylinderBufferGeometry(0, 4, 15);
        var standardGreen = new THREE.Color("#1bad2c");

        // This is a helper function to "tree-ify" a single player model
        function transformIntoTree(playerModel) {
            if (!playerModel) return; // Safety check

            // 2. Dispose of old parts to free up memory
            if (playerModel.geometry) {
                playerModel.geometry.dispose();
            }
            if (playerModel.material) {
                playerModel.material.dispose(); // Clean up the old car material
            }
            
            // 3. Apply the new tree parts
            playerModel.geometry = treeGeometry; // Use the shared geometry
            // Create a NEW, SEPARATE material for this player
            playerModel.material = new THREE.MeshLambertMaterial({color: standardGreen});

            // 4. *** THIS IS THE FIX FOR THE GREEN COLOR ***
            // Block the game's listeners from changing the material's color!
            // We redefine the 'color' property on this new material.
            Object.defineProperty(playerModel.material, 'color', {
                get: () => standardGreen, // Always report that the color is green
                set: (value) => { /* Do nothing! Block any new color! */ },
                configurable: true
            });

            // 5. Hide the wheels
            if (playerModel.children && playerModel.children.length > 0) {
                playerModel.children.forEach(function(child) {
                    child.visible = false;
                });
            }
        }

        // 6. Loop through ALL players and transform them
        var treeCount = 0;
        for (var playerId in players) {
            //A check to make sure we're looking at an actual player
            if (players.hasOwnProperty(playerId)) { 
                var player = players[playerId];
                if (player && player.model) {
                    transformIntoTree(player.model);
                    treeCount++;
                }
            }
        }

        console.log(`🌲 SUCCESS! 🌲 Transformed ${treeCount} players into GREEN trees!`);
        
        // 7. *** NEW CAMERA LOGIC (FIXED!) ***
        // We redefine the empty MODS() function that the game calls every frame.
        
        // Store the original MODS function, just in case (good practice)
        var originalMODS = (typeof MODS === 'function') ? MODS : function() {};

        MODS = function() {
            originalMODS(); // Call the original function if it existed
            
            // Calculate our own delta time and warp, just like the game's render()
            var modTimestamp = performance.now();
            var modTimePassed = modTimestamp - modLastTime;
            modLastTime = modTimestamp;
            
            if (modTimePassed > 250) modTimePassed = 250; // Clamp it
            var warp = modTimePassed / 16;
            
            // Check if the game is running and 'me' exists
            if (gameStarted && me && me.model && camera && warp > 0) {
                try {
                    // This is the NEW target, zoomed out and higher up
                    // I've set it to 12 units out and 6 units up.
                    var target = new THREE.Vector3(
                        me.model.position.x + Math.sin(-me.model.rotation.y) * 12, // Zoomed out
                        6, // Higher up
                        me.model.position.z + -Math.cos(-me.model.rotation.y) * 12 // Zoomed out
                    );
                    
                    // This is the ORIGINAL smooth camera logic from the game!
                    // It uses the global CAMERA_LAG variable to feel smooth.
                    camera.position.set(
                        camera.position.x * Math.pow(CAMERA_LAG, warp) + target.x * (1 - Math.pow(CAMERA_LAG, warp)),
                        camera.position.y * Math.pow(CAMERA_LAG, warp) + target.y * (1 - Math.pow(CAMERA_LAG, warp)), // Lag the height too!
                        camera.position.z * Math.pow(CAMERA_LAG, warp) + target.z * (1 - Math.pow(CAMERA_LAG, warp))
                    );
                    
                    // We must call lookAt again, because the main game loop
                    // already called it *before* we updated the camera.
                    camera.lookAt(me.model.position);

                } catch(e) {
                    console.error("Error in custom tree camera logic:", e);
                    // If it fails, stop trying so it doesn't break the game
                    MODS = originalMODS; 
                }
            }
        };
        
        console.log("🎥 Custom SMOOTH camera mode: ACTIVATED!");


    } catch (e) {
        console.error("An error occurred while trying to turn everyone into trees:", e);
    }
})();
