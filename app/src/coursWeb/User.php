<?php

namespace coursWeb;

class User
{
    const LOGIN_MIN_LENGTH = 3;
    const PASS_MIN_LENGTH = 3;
    
	private $id;
	public $login;
	public $xp;
	public $hp;
	public $power;
	
	private function __construct($id,$login,$xp,$hp,$power)
	{
		$this->id = (int) $id;
		$this->login = $login;
		$this->xp = (int) $xp;
		$this->hp = (int) $hp;
		$this->power = (int) $power;
	}
	
	public function toJSON()
	{
		return json_encode($this);
	}
	
	private static function getPasswordHash($password)
	{
		return \passwordHashUtils\PasswordHashUtils::create_hash($password);
	}
	
	private static function validatePassword($inputPassword,$dbPasswordHashed)
	{
		return \passwordHashUtils\PasswordHashUtils::validate_password($inputPassword, $dbPasswordHashed);
	}
	
	public static function login($login,$password)
	{
		$db = App::getInstance()->getDb();
		$query = $db->prepare('SELECT * FROM user WHERE login=:login');
		
		if ($query->execute([ 'login' => $login ]))
		{
			$userData = $query->fetch();
		
			if ($userData && self::validatePassword($password, $userData->password))
			{
				$user = new User($userData->id,$userData->login,$userData->xp,$userData->hp,$userData->power);
				$_SESSION['user'] = $user;
				return true;
			}
			else
			{
				return false;
			}
		}
		else
		{
			throw new UserException("Couldn't execute login query on DB");
		}
	}
	
	public static function register($login,$password)
	{
		if (strlen($login) < self::LOGIN_MIN_LENGTH)
		{
			throw new UserException('The login is too short! It must have at least ' . self::LOGIN_MIN_LENGTH . ' characters.');
		}
		else if (strlen($password) < self::PASS_MIN_LENGTH)
		{
			throw new UserException('The password is too short! It must have at least ' . self::PASS_MIN_LENGTH . ' characters.');
		}
		else
		{
			$db = App::getInstance()->getDb();
			$query = $db->prepare('SELECT 1 as value FROM user WHERE login=:login');
		
			if ($query->execute([ 'login' => $login ]))
			{
				if ($query->fetch())
				{
					throw new UserException('The login already exists!');
				}
				else
				{
					$passwordHash = self::getPasswordHash($password);
					$query = $db->prepare('INSERT INTO user ( login, password ) VALUES ( :login , :password )');
		
					if ($query->execute([ 'login' => $login, 'password' => $passwordHash ]))
					{
						return true;
					}
					else
					{
						throw new UserException("Couldn't execute register query on DB");
					}
				}
			}
			else
			{
				throw new UserException("Couldn't execute register check query on DB");
			}
		}
	}
	
	public function delete()
	{		
		$db = App::getInstance()->getDb();
		$query = $db->prepare('DELETE FROM user WHERE id=:id');
		
		if (!$query->execute([ 'id' => $this->id ]))
		{
			throw new UserException('Couldn\'t execute delete query on DB');
		}
	}
}