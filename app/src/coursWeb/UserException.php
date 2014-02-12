<?php

namespace coursWeb;

class UserException extends \Exception
{
	public function __construct($message)
	{
		parent::__construct('User error: ' . $message);
	}
}