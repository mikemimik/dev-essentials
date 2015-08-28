<a href="http://kmile.nl/post/73956428426/npm-vagrant-and-symlinks-on-windows" class="title"><span>NPM, Vagrant and Symlinks on Windows</span><div class="arrow"></div></a>
        <div class="caption">
          <p>
              <p>We started a new project last week that uses Grunt as a frontend task runner and Vagrant to provision our development environments. All went fine for the developers running Linux and MacOS, but once we started running <code>vagrant up</code> on Windows we ran into all sorts of issues.</p>

<h2>Vagrant on Windows</h2>

<p>Vagrant uses shared folders to map your development directory to the <code>/vagrant</code> path in your VM. This is done using shared folders in VirtualBox if you&rsquo;re running the default provider.</p>

<p>The issue is that Windows doesn&rsquo;t allow regular users to create symlinks. And because the <code>/vagrant</code> folder is actually just a Windows folder, the symlinks need to be created in Windows as well.</p>

<p>We quickly found a partial solution to the problem in this Vagrant Github issue: <a href="https://github.com/mitchellh/vagrant/issues/713#issuecomment-17296765" target="_blank">https://github.com/mitchellh/vagrant/issues/713#issuecomment-17296765</a></p>

<p>This didn&rsquo;t work for us though because you need to run your development prompts as an Administrator. This is definitely not a good practise.</p>

<h2>Symlinks as a regular user</h2>

<p>Luckily, there is a security policy setting that allows regular users to create symlinks. This turns out to be the <code>SeCreateSymbolicLinkPrivilege</code> privilege. If you are running Windows 7+ Professional+, you can use <code>secpol.msc</code> to grant your user this permission.</p>

<p>If you are using Windows Home or Home Premium, <a href="http://blog.rlucas.net/rants/dont-bother-with-symlinks-in-windows-7/" target="_blank">the policy editor is not included</a>. We found an alternative in PolsEdit from <a href="http://www.southsoftware.com/." target="_blank">http://www.southsoftware.com/.</a> Great!</p>

<p>But.. no luck yet :(</p>

<h2>No Bin Links</h2>

<p>One idea we had is to run <code>npm install</code> using the <code>--no-bin-links</code> option. This prevents some of the symlink issues, but we hadn&rsquo;t had consistent results with it. Alas!</p>

<h2>Maximum path length in Windows</h2>

<p>Windows also <a href="http://stackoverflow.com/questions/265769/maximum-filename-length-in-ntfs-windows-xp-and-windows-vista" target="_blank">enforces a maximum path length of 260 characters</a>. Running a <a href="http://stackoverflow.com/questions/18241258/npm-is-installing-dependencies-in-a-weird-recursive-way" target="_blank">large npm dependency tree</a> quickly gets to this path limit. Especially since your <code>/vagrant</code> directory is actually a Windows folder, probably sitting in <code>C:\Users\kmile\Development\Project</code> eating up valuable characters.</p>

<h2>Begone foul problems!</h2>

<p>After a day of troubleshooting or so we decided to move around the issue completely. Obviously we wanted <code>/vagrant</code> to be our project folder to quickly make changes, but is <code>node_modules</code> really necessary on the same folder? Usually, you want to <a href="http://www.futurealoof.com/posts/nodemodules-in-git.html" target="_blank">check in your node_modules in source control</a> for a deployed application, but since we were not developing a nodejs app (just using it for Grunt) we felt it was safe to add our <code>node_modules</code> to <code>.gitignore</code>.</p>

<p>In Vagrant, we create a symlink to <code>/tmp/node_modules</code> before running <code>npm install</code>, and this installs all dependencies on the Linux filesystem instead of the Windows share. It just leaves a regular shortcut file on the Windows share that points to nowhere.</p>

<p>Now our deployment works! Finally!</p>

<h2>Tidying up</h2>

<p>Since we are using Chef to provision our development box we added the following steps to our recipe:</p>

<pre><code># Since Vagrant on an NTFS host doesn't support symlinks properly,
# We decided to move the node_modules directory off the shared disk.
directory "/vagrant/node_modules" do
    recursive true
    action :delete
    not_if "test -L /vagrant/node_modules"
    only_if { node['vagrant']['symlink_npm'] }
end

directory "/tmp/node_modules" do
    owner "vagrant"
    group "vagrant"
    only_if { node['vagrant']['symlink_npm'] }
end

link "/vagrant/node_modules" do
    owner "vagrant"
    group "vagrant"
    to "/tmp/node_modules"
    only_if { node['vagrant']['symlink_npm'] }
end
</code></pre>

<p>To set the <code>node['vagrant']['symlink_npm']</code> variable, we added the following to our <code>Vagrantfile</code>:</p>

<pre><code>config.vm.provision :chef_solo do |chef|        
    chef.json = {
        'vagrant' =&gt; {
          'symlink_npm' =&gt; (RbConfig::CONFIG['host_os'] =~ /cygwin|mswin|mingw/) ? true : false
        }
    }
    chef.run_list = [ ... ]
end
</code></pre>

<p>A bit dirty, but works just fine.</p>

<p>Now we create the symlink to the <code>/tmp/node_modules</code> folder only when the Vagrant host is running Windows. In turn, we are not affected by symlink permissions or path length issues!</p>
