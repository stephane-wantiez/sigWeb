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
	public $fbId;
	public $firstName;
	public $lastName;
	public $email;
	public $picture;
	public $friends;
	
	private function __construct($id="",$login="",$xp=0,$hp=100,$power=0,$fbId=0,$firstName="",$lastName="",$email="",$picture="")
	{
		$this->id = (int) $id;
		$this->login = $login;
		$this->xp = (int) $xp;
		$this->hp = (int) $hp;
		$this->power = (int) $power;
		$this->fbId = (int) $fbId;
		$this->firstName = $firstName;
		$this->lastName = $lastName;
		$this->email = $email;
		$this->picture = $picture;
		$this->friends = [];
	}
	
	public function addXP($xpIncrement)
	{		
		$db = App::getInstance()->getDb();
		$query = $db->prepare('UPDATE user SET xp=xp+:xpInc WHERE id=:id');		
		if (!$query->execute([ 'xpInc' => $xpIncrement, 'id' => $this->id ]))
		{
			throw new UserException("Couldn't update user XP in DB");
		}

		$query = $db->prepare('SELECT xp FROM user WHERE id=:id');		
		if (!$query->execute([ 'id' => $this->id ]))
		{
			throw new UserException("Couldn't update user XP in DB");
		}
		
		$res = $query->fetch();
		if (!$res)
		{
			throw new UserException("Couldn't read new user XP from DB");
		}
		
		$this->xp = $res->xp;
		return $this->xp;
	}
	
	public function toJSON()
	{
		return json_encode([
			'name'    => $this->login,
			'xp'      => $this->xp,
			'hp'      => $this->hp,
			'power'   => $this->power,
			'picture' => $this->picture,
			'friends' => $this->friends
		]);
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
	
	private static function authentifyAppOnFacebook(\Facebook $fb)
	{
		$fbLoginUrl = $fb->getLoginUrl([
			'scope' => 'email,user_likes,publish_actions',
			'redirect_uri' => 'https://apps.facebook.com' . FB_APP_NAMESPACE
		]);
		
		die('<!doctype html><html><body>
			 	<script>
					top.location.href="' . $fbLoginUrl . '"
				</script>
			 </body></html>');
	}
	
	private function insertIntoDB()
	{
		$query = $db->prepare('INSERT INTO user (  login,  xp,  hp,  power,  fbId,  firstName,  lastName,  email )' .
							           ' VALUES ( :login, :xp, :hp, :power, :fbId, :firstName, :lastName, :email )');
			
		//var_dump($fbUser);
		
		$params = [ 'login' 	=> $this->firstName,
					'xp'    	=> $this->xp,
					'hp'    	=> $this->hp,
					'power' 	=> $this->power,
					'fbId'  	=> $this->fbId,
					'firstName' => $this->firstName,
					'lastName'  => $this->lastName,
					'email'     => $this->email ];
			
		if (!$query->execute($params))
		{
			throw new UserException("Couldn't execute insert user into DB");
		}
			
		$query = $db->prepare('SELECT id FROM user WHERE login=:login, fbId=:fbId, email=:email');
			
		if (!$query->execute([ 'login' => $this->firstName, 'fbId' => $this->fbId, 'email' => $this->email ]))
		{
			throw new UserException("Couldn't get created user from DB");
		}
			
		$userData = $query->fetch();
		
		if (!$userData)
		{
			throw new UserException("Couldn't get created user from DB");
		}
		
		$this->id = $userData->id;
	}
	
	private static function insertFacebookUser($fbUser)
	{		
		$user = new User( 0, $fbUser['first_name'], 0, 100, 0, $fbUser['id'], $fbUser['first_name'], $fbUser['last_name'], $fbUser['email']);
		$user->addPictureToUser();
		$user->insertIntoDB();
	}
	
	private function addPictureToUser()
	{
		if ($this->fbId != 0)
		{
			$this->picture = '//graph.facebook.com/' . $this->fbId . '/picture';
		}
	}
	
	private function setUserWithDBValues($data)
	{
		$this->id = $data->id;
		$this->login = $data->login;
		$this->xp = $data->xp;
		$this->hp = $data->hp;
		$this->power = $data->power;
		$this->fbId = $data->fbId;
		$this->firstName = $data->firstName;
		$this->lastName = $data->lastName;
		$this->email = $data->email;
		$this->addPictureToUser();
	}
	
	private function loadUser()
	{
		$queryStr = '';
		$params = [];
		
		if ($id != 0)
		{
			$query = 'SELECT * FROM user WHERE id=:id';
			$params = [ 'id' => $this->id ];
		}
		else if ($fbId != 0)
		{
			$query = 'SELECT * FROM user WHERE fbId=:fbId';
			$params = [ 'fbId' => $this->fbId ];
		}
		else if ($login != "")
		{
			$query = 'SELECT * FROM user WHERE login=:login';
			$params = [ 'login' => $this->login ];
		}
		else
		{
			throw new UserException('Can\'t load user w/o any key set');
		}
		
		$query = $db->prepare($queryStr);
		
		if (!$query->execute($params))
		{
			throw new UserException("Couldn't load user from DB");
		}
		
		$userData = $query->fetch();
	}
	
	public static function loginFacebook(\Facebook $fb)
	{
		// check logged FB user
		$fbUserId = $fb->getUser();
		if (!$fbUserId)
		{
			// not logged -> redirect to login
			self::authentifyAppOnFacebook($fb);
		}
		
		$fbUser = $fb->api('/me');
		
		// get DB user tuple for FB user
		$db = App::getInstance()->getDb();
		$query = $db->prepare('SELECT * FROM user WHERE fbId=:fbId');
		
		if (!$query->execute([ 'fbId' => $fbUserId ]))
		{
			throw new UserException("Couldn't get facebook user from DB");
		}
		
		$userData = $query->fetch();

		// if none, create DB user from FB user
		if (!$userData)
		{			
			$query = $db->prepare('INSERT INTO user (  login,  xp,  hp,  power,  fbId,  firstName,  lastName,  email )' .
										   ' VALUES ( :login, :xp, :hp, :power, :fbId, :firstName, :lastName, :email )');
			
			//var_dump($fbUser);
	
			$params = [ 'login' 	=> $fbUser['first_name'],
						'xp'    	=> 0,
						'hp'    	=> 100,
						'power' 	=> 0,
						'fbId'  	=> $fbUserId,
						'firstName' => $fbUser['first_name'],
						'lastName'  => $fbUser['last_name'],
						'email'     => $fbUser['email']];
			
			if (!$query->execute($params))
			{
				throw new UserException("Couldn't execute insert facebook user into DB");
			}
			
			$query = $db->prepare('SELECT * FROM user WHERE fbId=:fbId');
			
			if (!$query->execute([ 'fbId' => $fbUserId ]))
			{
				throw new UserException("Couldn't get created facebook user from DB");
			}
			
			$userData = $query->fetch();
		
			if (!$userData)
			{
				throw new UserException("Couldn't get created facebook user from DB");
			}
		}
		
		// save user in session
		$user = new User($userData->id,$userData->login,$userData->xp,$userData->hp,$userData->power,
						 $userData->fbId,$userData->firstName,$userData->lastName,$userData->email);
		$user->addPictureToUser();
		$user->loadFacebookFriendsList($fb);
		$_SESSION['user'] = $user;
		//var_dump($user);
		return true;
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
	
	public function updateFriendsWithXp($friendsId)
	{
		$queryStr = 'SELECT fbId AS id, firstName AS name, xp FROM user WHERE fbId IN ("' . implode('","', $friendsId) . '")';
		
		$db = App::getInstance()->getDb();
		$query = $db->prepare($queryStr);
		
		if (!$query->execute())
		{
			throw new UserException('Couldn\'t execute delete query on DB');
		}
		
		$this->friends = [];
		
		while($friendInfo = $query->fetch())
		{
			$this->friends[] = $friendInfo;
		}
	}
	
	public function loadFacebookFriendsList(\Facebook $fb)
	{
		$friends = $fb->api('/me/friends?fields=installed,first_name');
		//var_dump($friends);
		
		if ($friends && isset($friends["data"]))
		{
			$friendsId = [];
			
			foreach($friends['data'] as $friend)
			{
				if (isset($friend['installed']) && $friend['installed'])
				{
					$friendsId[] = $friend['id'];				
				}
			}
			
			$this->updateFriendsWithXp($friendsId);
		}
	}
}