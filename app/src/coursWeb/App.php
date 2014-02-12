<?php

namespace coursWeb;

class App
{
	const PAGE_LOCATION = 'Location: index.php';
    private static $instance = null;
    private $db;
    
    private function __construct()
    {
        $this->db = new \PDO( DB_DSN, DB_USER, DB_PASS );
        $this->db->setAttribute( \PDO::ATTR_ERRMODE,            \PDO::ERRMODE_WARNING );
        $this->db->setAttribute( \PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_OBJ );
        $this->db->exec('SET CHARACTER SET utf8');
    }
    
    public static function getInstance()
    {
        if (self::$instance === null)
        {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    public function getDb()
    {
    	return $this->db;
    }
    
    private function reloadPage()
    {
    	header(self::PAGE_LOCATION);
    	exit;
    }
    
    private function reloadPageWithParams($params)
    {
    	$loc = self::PAGE_LOCATION;
    	$firstParam = true;
    	foreach($params as $paramKey => $paramValue)
    	{
    		$loc = $loc . ($firstParam ? '?' : '&') . $paramKey . "=" . $paramValue;
    		$firstParam = false;
    	}
    	header($loc);
    	exit;
    }

    public function run()
    {
        $okMessage = false;
        $errorMessage = false;
        $userData = false;
        
        if (isset($_REQUEST['user-created']))
        {
        	$okMessage = 'User ' . $_REQUEST['user-created'] . ' created';
        }
        else if (isset($_REQUEST['user-deleted']))
        {
        	$okMessage = 'User deleted';
        }
        
        try
        {        	
	        if (isset($_REQUEST['logout']))
	        {
	        	session_destroy();
				$this->reloadPage();        	
	        }
	        else if (isset($_REQUEST['delete']) && isset($_SESSION['user']))
	        {
	        	$_SESSION['user']->delete();
	        	session_destroy();
				$this->reloadPageWithParams(['user-deleted' => 1]);
	        }
	        else if (isset($_REQUEST['action-login']) || isset($_REQUEST['action-register']))
	        {
	            if (!isset($_REQUEST['login']))
	            {
	                $errorMessage = 'The login is missing!';
	            }
	            else if (!isset($_REQUEST['password']))
	            {
	                $errorMessage = 'The password is missing!';
	            }
	            else
	            {
	                $login = trim($_REQUEST['login']);
	                $password = $_REQUEST['password'];
	                
	                if (isset($_REQUEST['action-register']))
	                {
                		User::register($login, $password);
                		$this->reloadPageWithParams(['user-created' => $login]);
	                }
	                else if (isset($_REQUEST['action-login']))
	                {
	                	$logged = User::login($login, $password);
	                	if (!$logged)
	                	{
	                		$errorMessage = 'Invalid login and/or password for user';
	                	}
	                	else
	                	{
							$this->reloadPage();
	                	}
	                }
	            }
	        }        
        }
        catch(UserException $e)
        {
        	$errorMessage = $e->getMessage();
        }
        
        if (isset($_SESSION['user']))
        {
            include( TEMPLATES_PATH . 'main.tpl' );
        }
        else
        {
            include( TEMPLATES_PATH . 'login.tpl' );
        }
    }
}