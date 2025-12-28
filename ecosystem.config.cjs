module.exports = {
    apps: [
        {
            name: "tuuci-agent",
            script: "agent.js",
            interpreter: "node",
            watch: false,
            autorestart: false,
            cron_restart: "0 * * * *", // ⏱️ cada 1 hora
            env: {
                NODE_ENV: "production"
            }
        }
    ]
};

/*
COMANDOS ÚTILES (GUÁRDALOS)
Acción		   Comando
Arrancar	    pm2 start ecosystem.config.cjs
Ver procesos	pm2 status
Ver logs	    pm2 logs tuuci-agent --lines 100
Reiniciar	    pm2 restart tuuci-agent
Detener	        pm2 stop tuuci-agent
Eliminar	    pm2 delete tuuci-agent
AUTOSTART       pm2 startup        -> Arranke automatico con windows
GUARDE          pm2 save
*/
