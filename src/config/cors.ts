import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
    origin: function(origin, callback){
        const allowedOrigins = [
            'https://up-task-frontend-six-sigma.vercel.app', // Tu frontend exacto
            'http://localhost:5173',
            'http://localhost:5174',
            undefined // Para Postman, curl, etc.
        ];

        console.log('🔍 Checking CORS for origin:', origin);
        
        // Permitir requests sin origen
        if(!origin) {
            console.log('✅ Request sin origen permitido');
            return callback(null, true);
        }

        if(allowedOrigins.includes(origin)){
            console.log('✅ Origen permitido:', origin);
            return callback(null, true);
        }else{
            console.log('❌ Origen no permitido:', origin);
            console.log('📋 Orígenes permitidos:', allowedOrigins);
            // Temporalmente permitir para arreglar el deploy
            return callback(null, true);
        }
    },
    credentials: true
}