(function() {
    var checkPlayers = setInterval(function() {
        if (typeof players !== 'undefined' && Object.keys(players).length > 0) {
            clearInterval(checkPlayers); // stop checking
            // ---- now run your tree code ----
            (function() {
                console.log("Players detected! Running tree mod...");
                var modLastTime = performance.now();
                var treeGeometry = new THREE.CylinderBufferGeometry(0, 4, 15);
                var standardGreen = new THREE.Color("#1bad2c");
                
                function transformIntoTree(playerModel) {
                    if (!playerModel) return;
                    if (playerModel.geometry) playerModel.geometry.dispose();
                    if (playerModel.material) playerModel.material.dispose();
                    playerModel.geometry = treeGeometry;
                    playerModel.material = new THREE.MeshLambertMaterial({color: standardGreen});
                    Object.defineProperty(playerModel.material, 'color', { get: () => standardGreen, set: () => {}, configurable: true });
                    if (playerModel.children) playerModel.children.forEach(c => c.visible = false);
                }

                var treeCount = 0;
                for (var playerId in players) {
                    if (players.hasOwnProperty(playerId)) {
                        var player = players[playerId];
                        if (player && player.model) {
                            transformIntoTree(player.model);
                            treeCount++;
                        }
                    }
                }
                console.log(`🌲 Transformed ${treeCount} players into trees!`);

                // redefine MODS safely
                var originalMODS = (typeof MODS === 'function') ? MODS : function(){};
                MODS = function() {
                    originalMODS();
                    var modTimestamp = performance.now();
                    var modTimePassed = modTimestamp - modLastTime;
                    modLastTime = modTimestamp;
                    var warp = Math.min(modTimePassed / 16, 250 / 16);
                    if (gameStarted && me && me.model && camera && warp > 0) {
                        try {
                            var target = new THREE.Vector3(
                                me.model.position.x + Math.sin(-me.model.rotation.y) * 12,
                                6,
                                me.model.position.z + -Math.cos(-me.model.rotation.y) * 12
                            );
                            camera.position.set(
                                camera.position.x * Math.pow(CAMERA_LAG, warp) + target.x * (1 - Math.pow(CAMERA_LAG, warp)),
                                camera.position.y * Math.pow(CAMERA_LAG, warp) + target.y * (1 - Math.pow(CAMERA_LAG, warp)),
                                camera.position.z * Math.pow(CAMERA_LAG, warp) + target.z * (1 - Math.pow(CAMERA_LAG, warp))
                            );
                            camera.lookAt(me.model.position);
                        } catch(e) { MODS = originalMODS; }
                    }
                };
                console.log("🎥 Custom camera: ACTIVATED!");
            })();
        }
    }, 100); // check every 100ms
})();
