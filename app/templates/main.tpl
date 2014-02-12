<?php
include('header.tpl');
?>

<script>
	var user = <?php echo $_SESSION['user']->toJSON(); ?>
</script>

</head>
<body>

<div id="welcome">Welcome <?php echo $_SESSION['user']->login; ?> !</div>

<div id="screen">
    <canvas class="scene-view" width="1024" height="600"></canvas>
    <div id="gui"></div>
</div>

</body>
</html>