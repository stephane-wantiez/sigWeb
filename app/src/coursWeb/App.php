<?php

namespace coursWeb;

class App
{
    const LOGIN_MIN_LENGTH = 3;

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

    public function run()
    {
        /*$query = $this->db->prepare('SELECT name,id FROM testtable ORDER BY name');
        $data = [];

        if ($query->execute())
        {
            $data = $query->fetchAll();
        }*/
        

        $okMessage = false;
        $errorMessage = false;
        $userData = false;
        
        if (isset($_REQUEST["action-login"]) || isset($_REQUEST["action-register"]))
        {
            if (!isset($_REQUEST["login"]))
            {
                $errorMessage = 'The login is missing!';
            }
            else if (!isset($_REQUEST["password"]))
            {
                $errorMessage = 'The password is missing!';
            }
            else
            {
                $login = trim($_REQUEST["login"]);
                $password = $_REQUEST["password"];
                
                if (isset($_REQUEST["action-register"]))
                {   
                    if (strlen($login) < self::LOGIN_MIN_LENGTH)
                    {
                        $errorMessage = 'The login is too short!';
                    }
                    else
                    {   
                        $query = $this->db->prepare('SELECT 1 as value FROM user WHERE login=:login');
                    
                        if ($query->execute([ 'login' => $login ]))
                        {                         
                            if ($query->fetch())
                            {
                                $errorMessage = 'The login already exists!';
                            }
                            else
                            {            
                                $query = $this->db->prepare('INSERT INTO user ( login, password ) VALUES ( :login , :password )');
                                
                                if ($query->execute([ 'login' => $login, 'password' => $password ]))
                                {
                                    header('Location: testoo.php');
                                    exit;
                                }
                                else
                                {
                                    $errorMessage = 'Error while creating the user';
                                }
                            }
                        }
                    }
                }
                else if (isset($_REQUEST["action-login"]))
                {
                    $query = $this->db->prepare('SELECT * FROM user WHERE login=:login AND password=:password');
                    
                    if ($query->execute([ 'login' => $login , 'password' => $password ]))
                    {
                        $userData = $query->fetch();
                        
                        if (!$userData)
                        {
                            $errorMessage = 'Invalid login!';
                        }
                        else
                        {
                            $_SESSION['user'] = $userData;
                            header('Location: testoo.php');
                            exit;
                        }
                    }
                }
            }
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