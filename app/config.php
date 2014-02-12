<?php 
/** 
* Script file generated on Wed, 12 Feb 2014 16:18:11 +0000
**/


/** From file 01-define.php **/

define('NL',"\n");
define('TAB',"\t");
define('BR',"<br/>");

define('PROJECT_PATH', __DIR__ . '/../' ); // relative to compiled config.php file

define('APP_PATH', PROJECT_PATH . 'app/' );
define('VENDOR_PATH', PROJECT_PATH . 'vendor/' );

define('SRC_PATH', APP_PATH . 'src/' );
define('TEMPLATES_PATH', APP_PATH . 'templates/' );

define('ENCRYPT_ENABLED', false );



/** From file 10-database.php **/

define('DB_DRIVER','mysql');
define('DB_HOST','localhost');
define('DB_NAME','cours-web');
define('DB_USER','root');
define('DB_PASS','');

define('DB_DSN', DB_DRIVER . ':host=' . DB_HOST . ';dbname=' . DB_NAME );


/** From file 10-declare-namespace.php **/

include VENDOR_PATH . 'Zend/Loader/StandardAutoloader.php' ;

$zendLoader = new \Zend\Loader\StandardAutoloader();
$zendLoader->register();

$zendLoader->registerNamespace( 'aes',               VENDOR_PATH . 'aes' );
$zendLoader->registerNamespace( 'passwordHashUtils', VENDOR_PATH . 'passwordHashUtils' );
$zendLoader->registerNamespace( 'coursWeb',             SRC_PATH . 'coursWeb' );



/** From file 10-uri.php **/

define( 'WEB_STATIC_URI', '/sigWeb-static/' );


/** From file 20-session.php **/

session_name('SIGWEB_SESSID');
session_start();

