README - Tweet Parser - CRVM Project
---

**Membres** : Valentin Koeltgen, Uytterhaegen Romain, Parpette Corentin, Corsin
Maxime

#### Description
Offre un parser descendant implémenté en Javascript dans le but de lire et manipuler des fichiers de Tweet. Les fichiers sont au format CSV et doivent respecter la grammaire suivante.

---

#### Contexte
Ce projet a été effectué dans le cadre d'un cours sur les fondements à l'ingénierie logicielle ([GL02](https://moodle.utt.fr/course/view.php?id=1423)) dirigé par M.TIXIER à [l'Université de Technologie de Troyes (UTT)](https://www.utt.fr).  
Vous pouvez trouver le sujet sur ce dépôt [ici](https://github.com/koeltv/TweetParser/blob/master/Projet_GL02_A20_Synevent_SujetA.pdf).

---

#### Jeu de données test
[donneesSujetA](https://github.com/koeltv/TweetParser/tree/master/donneesSujetA) (les données test fournies disponibles sur Moodle)

---

#### Grammaire suivie
La grammaire utilisée ici est la grammaire ABNF suivant la norme [RFC5234](https://tools.ietf.org/html/rfc5234).

FichierTweet = Entete CRLF *(tweet CRLF)  
Entete = ’coordinates,created_at,hashtags,media,urls,favourite_count,id,in_reply_to_screen_name,in_reply_to_status_id,in_reply_to_user_id,lang,place,possibly_sensitive,retweet_count,retweet_id,retweet_screen_name,source,text,tweet_url,user_created_at,user_screen_name,user_default_profile_image,user_description,user_favourites_count,user_followers_count,user_friends_count,user_listed_count,user_location,user_name,user_screen_name,user_statuses_count,user_time_zone,user_urls,user_verified’  
tweet = coordinates ‘,’ created_at ‘,’ hashtags ‘,’ media ‘,’ urls ‘,’ favourite_count ‘,’ id‘,’in_reply_to_screen_name‘,’in_reply_to_status_id‘,’in_reply_to_user_id‘,’lang‘,’place‘,’possibly_sensitive‘,’retweet_count‘,’retweet_id‘,’retweet_screen_name‘,’source‘,’text‘,’tweet_url‘,’user_created_at‘,’user_screen_name‘,’user_default_profile_image‘,’user_description‘,’user_favourites_count‘,’user_followers_count‘,’user_friends_count‘,’user_listed_count‘,’user_location‘,’user_name’,user_screen_name’user_statuses_count‘,’user_time_zone‘,’user_urls ‘,’ user_verified  
coordinates = *1(coordinate ‘,’ coordinate)  
coordinate = 0*1’-’ 1*DIGIT.1*DIGIT  
created_at = timestamp  
hashtags = *(1*VCHAR WSP)  
media = *(‘​https://twitter.com/​’ NomUtilisateur ‘/status/’ 1*DIGIT PHOTO)  
PHOTO = ‘photo/’ DIGIT  
urls = ‘http’ *1’s’ ‘:// 1*(VCHAR)  
favourite_count = 1*DIGIT  
id = 1*DIGIT  
in_reply_to_screen_name = *1NomUtilisateur  
NomUtilisateur = 1*VCHAR  
in_reply_to_status_id = *DIGIT  
in_reply_to_user_id = *DIGIT  
lang = 2[a-z] / ‘undefined’ ;  
place = 1*ALPHA’,’ 1*ALPHA  
possibly_sensitive = *1boolean  
retweet_count = 1*DIGIT  
reweet_id = *DIGIT  
retweet_screen_name = *1NomUtilisateur  
source = ‘<a href= “ ‘ urls ‘ “ rel="nofollow”>’ 1*VCHAR ‘</a>’  
Text = *1(‘RT @’ NomUtilisateur’) 1*VCHAR  
tweet_url = media  
user_created_at = timestamp  
user_screen_name = *1NomUtilisateur  
user_default_profile_image = boolean  
user_description = *VCHAR  
user_followers_count =1*DIGIT  
user_friends_count = 1*DIGIT  
user_favourites_count = 1*DIGIT  
user_listed_count = 1*DIGIT  
user_location = *VCHAR  
user_name =*VCHAR  
user_statuses_count = 1*DIGIT  
user_time_zone = *DIGIT  
user_urls = urls  
user_verified = boolean  

boolean = ‘VRAI’/ ‘FAUX’  
timestamp = day WSP month WSP day_number WSP time WSP time_zone WSP year  
day = ‘Mon’ / ’Tue’ / ’Wed’ / ’Thu’ / ’Fri’ / ’Sat’ / ’Sun’  
month = ‘Jan’ / ‘Feb’ /’ Mar’ / ‘Apr’ / ‘May’ / ‘Jun’ / ‘Jul’ / ‘Aug’ / ‘Sep’ / ‘Oct’ / ‘Nov’ / ‘Dec’  
day_number = [1-31]  
time = [0-2]DIGIT  2(‘:’ [0-5]DIGIT)  
time_zone = (‘+’/’-’) 4DIGIT  
year = 4DIGIT  
date = 2(2DIGIT’/’) 4DIGIT  

---

### Installation
run the following command in a terminal of your choice:
`$ npm install`

---

### Utilisation
`$ node caporalCli.js <command> {paramètres} [options]`

`<command>` : "check"	vérifie si un fichier/ensemble de fichier respecte la grammaire

`{paramètres}`
file :	fichier/dossier à analyser

`[options]`
-s ou --showSymbols :	affiche chaque étape de l'analyse
-t ou --showTokenize :	affiche le résultat de la tokenization

Exemple : node caporalCli.js check donneesSujetA -s

`<command>` : "readme"    affiche ce fichier d'aide

Exemple : node caporalCli.js readme

`<command>` : "mostRetweeted" ou "mr" affiche le top10 des tweets les plus retweetés pour un certain hashtag

`{paramètres}`
file :	fichier/dossier à analyser
hashtag : hashtag à rechercher

`[options]`
-p ou --png : permet de sortir le graphique au format png

Exemple : node caporalCli.js mostRetweeted donneesSujetA eaw18 -p

`<command>` : "mostCompleteAuthors" ou "mca"  Créer un graphique représentant les 10 auteurs ayant le plus d'informations sur eux

`{paramètres}`
file :	fichier/dossier à analyser

`[options]`
-p ou --png :   permet de sortir le graphique au format png

Exemple : node caporalCli.js mca donneesSujetA --png

`<command>` : "associatedHashtags" ou "assohashs"	liste les hashtags associés à un certain hashtag

`{paramètres}`
file :	fichier/dossier à analyser
hashtag : hashtag à rechercher

`[options]`
-p ou --png : permet de sortir le graphique au format png

Exemple : node caporalCli.js associatedHashtags donneesSujetA eaw18

`<command>` : "tweetInWorld" ou "tiw"		visualisation de la répartition des tweets dans le monde

`{paramètres}`
file :	fichier/dossier à analyser

`[options]`
-p ou --png :   permet de sortir le graphique au format png
-u ou --albersUsa : change la projection de la carte vers la projection albersUsa
-r ou --roundedMap :    change la projection de la carte vers la projection equalEarth

Exemple : node caporalCli.js tiw donneesSujetA --albersUsa -p

`<command>` : "filter"	filtre les tweets selon certains critères

`{paramètres}`
file :	fichier/dossier à analyser

`[options]`
-n ou --name <name> :	affiche chaque tweet contenant le nom d'utilisateur <name>
-a ou --hashtags <hashtags> : affiche chaque tweet contenant une référence à <hashtags>
-r ou --nbrt <nbrt> : affiche chaque tweet comparé à <nbrt> retweets
-d ou --date <date> : affiche chaque tweet comparé avec <date>
-s ou --superieur : affiche chaque tweet supérieur avec l'option souhaitée (voir autres options)
-i ou --inferieur : affiche chaque tweet inférieur avec l'option souhaitée (voir autres options)
-e ou --equal : affiche chacun des tweets égaux avec l'option souhaitée (voir autres options)

Exemple : node caporalCli.js filter donneesSujetA --name documentnow
	      node caporalCli.js filter tweets.csv --date 13/08/2001 --superieur (donne tous les tweets du fichier avec une date supérieur au 13/08/2001)


`<command>` : "numberOfHashtags" or "noh" Produit une visualisation du nombre d'utilisation par jour du hashtag saisi en paramètre sur une période donnée
Si le nombre d'hashtags pour une journée contenue dans la période est égal à 0, ce jour n'est pas affiché dans la visualisation.
(Nous nous sommes basés sur la maquette fourni en annexe du cahier des charges pour cette commande)
(ex: node caporalCli.js numberOfHashtags donneesSujetA eaw18 23/03/2018 31/03/2018)

`{paramètres}`
file :	fichier/dossier à analyser
hashtag : hashtag à compter
periodBegin : date de début
periodEnd: date de fin

`[options]`
-p or --png : permet de sortir le graphique au format png

Exemple : node caporalCli.js numberOfHashtags donneesSujetA eaw18 23/03/2018 31/03/2018
