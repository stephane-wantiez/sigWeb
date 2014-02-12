<?php
include('header.tpl');
?>

</head>
<body>

<?php if ($errorMessage) { ?>
<div style="color:red;font-weight:bold;"><?php echo $errorMessage; ?></div>
<?php } ?>
<?php if ($okMessage) { ?>
<div style="color:blue;font-weight:italic;"><?php echo $okMessage; ?></div>
<?php } ?>

<form method="POST" action="<?php echo $_SERVER['PHP_SELF']; ?>">
    <div style="color:white;">
        <label for="login">Login: </label> 
        <input type="text" id="login" name="login"></input>
    </div>
    <div style="color:white;">
        <label for="password">Password: </label> 
        <input type="password" id="password" name="password"></input>
    </div>
    <div>
        <input type="submit" name="action-login" value="Login"></input>
        <input type="submit" name="action-register" value="Register"></input>
    </div>
</form>

</body>
</html>