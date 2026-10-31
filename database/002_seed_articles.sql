-- Biblioteca felina inicial: contenido educativo de ejemplo.
-- Idempotente: se puede ejecutar varias veces sobre la misma base.
BEGIN;

INSERT INTO articles (title, slug, summary, content, category, status, published_at)
VALUES
(
 'Alimentación segura: qué sí y qué evitar',
 'alimentacion-segura',
 'Qué alimentos conviene mantener lejos de su plato y cómo cambiar de comida sin sorpresas.',
 $body$Los gatos son carnívoros estrictos: necesitan proteína animal y toleran mal los cambios bruscos de dieta. Si vas a cambiar de alimento, hazlo de forma gradual, mezclando ambas comidas durante varios días.

Hay alimentos que conviene mantener lejos de su plato: cebolla, ajo, cebollín, chocolate, uvas y pasas, alcohol, cafeína y masas crudas con levadura. Tampoco conviene darle huesos cocidos, lácteos en cantidad ni comida condimentada de nuestra mesa.

La cantidad diaria depende de su edad, peso y actividad, y su veterinario es quien mejor puede ajustarla. Como referencia práctica, revisa que el alimento declare proteína animal entre los primeros ingredientes y que esté formulado para su etapa de vida.

Si sospechas que comió algo de esa lista, no esperes a que aparezcan síntomas: consulta a tu veterinario o acude a una clínica. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
 'Alimentación','Published', now() - interval '1 hour'
),
(
 'Señales de dolor que suelen pasar desapercibidas',
 'senales-de-dolor',
 'Los gatos esconden el dolor; estos cambios pequeños avisan antes de que sea evidente.',
 $body$Los gatos esconden el dolor: es parte de su instinto de supervivencia. Por eso conviene observar cambios pequeños pero sostenidos en el tiempo.

Señales frecuentes: esconderse más de lo habitual, dejar de saltar a sus alturas de siempre, postura encorvada, orejas hacia atrás, pelo descuidado, comer menos, maullar distinto o evitar que lo toquen en una zona concreta.

El dolor dental y articular es común y pasa desapercibido. Si notas que mastica de un lado, babea, se lame una pata de forma obsesiva o camina rígido, vale la pena una revisión.

No administres analgésicos humanos: muchos son tóxicos para los gatos. Consulta a su veterinario antes de dar cualquier medicamento. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
 'Salud','Published', now() - interval '2 hours'
),
(
 'Primeras semanas en un hogar nuevo',
 'primeras-semanas-en-casa',
 'Cómo acompañar la adaptación de un gato adoptado sin forzar el contacto.',
 $body$Un gato nuevo necesita tiempo, espacio y rutina. Lo que para nosotros es un hogar cómodo, para él es un territorio desconocido.

Empieza con una habitación tranquila que tenga comida, agua, arenero, un escondite y una manta con olor familiar. Deja que salga a explorar a su ritmo; no lo saques a la fuerza ni invites visitas los primeros días.

Acércate con voz suave, ofrece juego con una varita y deja que sea él quien inicie el contacto. Evita cargarlo en brazos si se tensa: la confianza se construye desde abajo y con paciencia.

La adaptación puede tomar días o semanas. Si deja de comer, se esconde todo el tiempo o muestra agresividad intensa, consulta con un veterinario o con un especialista en comportamiento.$body$,
 'Comportamiento','Published', now() - interval '3 hours'
),
(
 'Agua e hidratación: cómo lograr que beba más',
 'agua-e-hidratacion',
 'Ideas sencillas para que tu gato tome más agua, especialmente en climas cálidos.',
 $body$Los gatos descienden de animales de zonas secas y suelen beber poco. La deshidratación leve pasa desapercibida y afecta especialmente a gatos mayores o con problemas renales.

Prueba varias fuentes: una fuente de agua corriente, varios recipientes de cerámica o acero en distintos cuartos y agua limpia cambiada a diario. Mantén el agua lejos del arenero y, si tu gato lo prefiere, separada también del plato de comida.

La comida húmeda ayuda a la hidratación. Si tu gato solo come alimento seco, coméntalo con su veterinario para valorar cómo aumentar su ingesta de líquidos.

Señales para consultar: encías pegajosas, piel que tarda en volver a su sitio, orina muy concentrada o menos frecuente y apatía. Ante cualquiera de ellas, busca atención veterinaria.$body$,
 'Alimentación','Published', now() - interval '4 hours'
),
(
 'La caja de arena ideal',
 'caja-de-arena-ideal',
 'Tamaño, ubicación y limpieza: lo que evita muchos problemas urinarios y de conducta.',
 $body$Una caja de arena bien resuelta previene muchos problemas de conducta y de salud urinaria.

Regla práctica: una caja por gato más una extra, en lugares tranquilos, con salida libre y lejos de la comida. El arenero debe ser amplio (al menos una vez y media el largo del gato), con bordes bajos si es un gatito o un gato mayor.

Limpia los desechos a diario y cambia la arena con la frecuencia que indique el fabricante. Evita areneros con tapa y perfumes fuertes: concentran olores y muchos gatos los rechazan.

Si tu gato deja de usar el arenero, orina fuera o se queda mucho tiempo dentro sin producir orina, consulta pronto: puede ser un problema médico y no solo un cambio de preferencia.$body$,
 'Cuidados','Published', now() - interval '5 hours'
),
(
 'Vacunas y desparasitación: qué preguntar a tu veterinario',
 'vacunas-y-desparasitacion',
 'Qué conversar en la consulta para armar un plan acorde a la vida real de tu gato.',
 $body$Las vacunas y la desparasitación se ajustan a la edad, el estilo de vida y el riesgo de cada gato. No existe un calendario único para todos.

Pregunta a tu veterinario: qué vacunas recomienda para un gato que vive dentro de casa, cada cuánto conviene repetirlas, qué parásitos son frecuentes en tu zona y si hace falta desparasitar también a las personas que conviven con él.

Lleva un registro de fechas y de cualquier reacción que haya tenido. Si tu gato presentó una reacción previa, coméntalo antes de la siguiente dosis.

La revisión anual es una buena oportunidad para actualizar el plan y detectar a tiempo cambios de peso o dentales. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
 'Prevención y urgencias','Published', now() - interval '6 hours'
),
(
 'Juego y enriquecimiento en espacios pequeños',
 'juego-y-enriquecimiento',
 'Dos sesiones cortas al día cambian el ánimo de un gato de apartamento.',
 $body$El juego no es solo diversión: descarga energía, reduce ansiedad y fortalece el vínculo con su familia.

Dos sesiones cortas al día de diez a quince minutos con una varita suelen ser suficientes para muchos gatos de apartamento. Deja que cace, atrape y “mate” la presa al final: esa secuencia completa su instinto.

Alterna juguetes y retira los que tengan hilos, plumas sueltas o piezas pequeñas que pueda tragar. Las cajas, los rascadores y las alturas también cuentan como enriquecimiento.

Si tu gato juega agresivo con manos y pies, redirige la conducta hacia un juguete y evita el castigo: el castigo suele aumentar la tensión.$body$,
 'Comportamiento','Published', now() - interval '7 hours'
),
(
 'Plantas, hilos y ventanas: peligros frecuentes en casa',
 'peligros-en-casa',
 'Objetos cotidianos que conviene revisar si vives con un gato curioso.',
 $body$Algunos objetos cotidianos son más peligrosos de lo que parecen.

Hilos, agujas, elásticos y cintas pueden causar obstrucciones si los traga. Las cuerdas de persianas y los cables eléctricos también son un riesgo, y las ventanas sin malla están detrás de muchas caídas en gatos de ciudad.

Varias plantas comunes son tóxicas para los gatos, entre ellas los lirios, las azaleas y la difenbaquia. Si tienes plantas, verifica cada especie antes de dejarla a su alcance.

Ante la sospecha de ingestión de un objeto o de una planta tóxica, acude a una clínica y lleva una foto o una muestra. No induzcas el vómito por tu cuenta. Este contenido es educativo y no sustituye una evaluación profesional.$body$,
 'Prevención y urgencias','Published', now() - interval '8 hours'
),
(
 'Cómo acompañar a un gato mayor',
 'acompanar-a-un-gato-mayor',
 'Ajustes simples en casa y controles más frecuentes a partir de los siete u ocho años.',
 $body$A partir de los siete u ocho años conviene observar con más atención.

Los gatos mayores duermen más, pierden masa muscular y pueden desarrollar problemas dentales, renales o articulares. Muchos cambios que parecen “normales por la edad” son tratables si se detectan temprano.

Adapta el entorno: rampas o escalones para sus sitios favoritos, arenero con bordes bajos, comida y agua cerca de sus zonas de descanso y camas abrigadas si el clima es frío.

Una revisión cada seis meses permite controlar peso, presión y análisis básicos. No asumas que “ya no tiene arreglo”: consulta siempre a su veterinario.$body$,
 'Cuidados','Published', now() - interval '9 hours'
),
(
 'Calor y humedad en Caracas: cómo refrescar a tu gato',
 'calor-y-humedad',
 'Qué hacer en los días más calurosos y cuándo es una urgencia.',
 $body$En Caracas el calor húmedo puede afectar a los gatos, sobre todo a los de pelo largo, a los mayores y a los que tienen sobrepeso.

Ofrece sombra, agua fresca en varios puntos y superficies frescas donde tumbarse, como cerámica o el suelo del baño. El ventilador mueve el aire pero no enfría el ambiente, y nunca conviene dejar al gato en una habitación cerrada sin ventilación.

Cepilla su pelo para evitar nudos y evita el juego intenso o los paseos en las horas de más calor. Los gatos se asean solos y no necesitan baños frecuentes.

Señales de golpe de calor: jadeo, salivación abundante, encías muy rojas, debilidad o tambaleo. Es una urgencia: moja su cuerpo con agua tibia y acude a una clínica de inmediato.$body$,
 'Cuidados','Published', now() - interval '10 hours'
),
(
 'Visitas al veterinario sin estrés',
 'visitas-veterinario-sin-estres',
 'Cómo preparar la transportadora y el viaje para que la consulta sea más llevadera.',
 $body$El traslado puede ser más estresante que la consulta en sí.

Acostumbra al gato a la transportadora dejándola abierta en casa con una manta y algún premio. Cubrirla con una toalla durante el viaje reduce los estímulos y suele calmarlo.

No lo alimentes justo antes de salir si se marea; pregunta a tu veterinario cómo manejarlo. Evita llevar al gato suelto en el coche y sujeta la transportadora para que no se mueva.

Anota en el teléfono lo que quieres preguntar y cualquier cambio de comportamiento de los últimos días. Una consulta ordenada aprovecha mejor el tiempo y ayuda a que el gato vuelva a casa más tranquilo.$body$,
 'Comportamiento','Published', now() - interval '11 hours'
)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
