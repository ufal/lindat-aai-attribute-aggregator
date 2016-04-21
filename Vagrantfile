# -*- mode: ruby -*-
# vi: set ft=ruby :

#=========================================
# for CLARIN+ by lindat (jm)
# See README.md for more details
#=========================================


####################################
# basic config
####################################

SETTINGS = {
    "synced_folders" => {
        "/opt/aagregator/backend-installation/" => "./installation",
    },
    "nfs" => false, 
}


# Actual Vagrant configs
#
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|

    # if you do not know what it is - ignore
    if Vagrant.has_plugin?('vagrant-cachier')
       # http://fgrehm.viewdocs.io/vagrant-cachier
       config.cache.scope = :box
    end

    # base box definition
    #
    config.ssh.forward_agent = true
    
    # synced folders
    #   - one folder in guest/host machines e.g., Projects or www
    if SETTINGS.has_key?('synced_folders')
        SETTINGS['synced_folders'].each { |target, source|
          if source
            config.vm.synced_folder source, target, :nfs => SETTINGS['nfs'], :create => true
          end
        }
    end

    # small tuning - utf8, bell off
    #
    config.vm.provision :shell, :inline => "locale | grep 'LANG=en_US.UTF-8' > /dev/null || sudo update-locale --reset LANG=en_US.UTF-8"
    config.vm.provision :shell, :inline => "grep '^set bell-style none' /etc/inputrc || echo 'set bell-style none' >> /etc/inputrc"
    config.vm.provision :shell, :inline => "apt-get update"

    #
    #
    ip_core = 22
    ip_end = 98    
    boxes = [
      { :name       => :ubuntu14x64,
        :box        => "ubuntu/trusty64",
      },
    ]    

    #=================
    # set up 
    #
    boxes.each do |opts|
        config.vm.define opts[:name] do |vmbox|
            vmbox.vm.box = opts[:box]
            ip = ip_core.to_s + "." + ip_core.to_s + "." + ip_core.to_s + "." + ip_end.to_s
            ip_end = ip_end + 1
            port_fwd = 3000 + ip_core
            vmbox.vm.network :private_network, ip: ip
            vmbox.vm.network :forwarded_port, guest: 22, host: 2322, auto_correct: true
            # node.js backend (make it listen on 3022 on host and 3001 on guest)
            vmbox.vm.network :forwarded_port, guest: 3001, host: port_fwd
            vmbox.vm.hostname = "%s.dev" % opts[:name].to_s
            vmbox.vm.provider :virtualbox do |v|
                v.customize ["modifyvm", :id, "--name", vmbox.vm.hostname]
                v.customize ["modifyvm", :id, "--ioapic", "on"]
                v.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
                v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/v-root", "1"]
                v.cpus = 2
                v.memory = 512
            end    

            # set up our environment
            #
            vmbox.vm.provision "shell", path: "/opt/aagregator/backend-installation/setup.sh"
        end
    end
    
end
